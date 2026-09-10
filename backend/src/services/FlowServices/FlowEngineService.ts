import Mustache from "mustache";
import { logger } from "../../utils/logger";
import Contact from "../../models/Contact";
import Flow, { FlowNode } from "../../models/Flow";
import FlowSession from "../../models/FlowSession";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Prompt from "../../models/Prompt";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { ExecuteAIService } from "../AI/ExecuteAIService";
import { getIO } from "../../libs/socket";

// Limite de nós executados em sequência numa única mensagem recebida — evita
// que um fluxo com ciclo mal montado (ex.: condição que sempre volta pra trás)
// trave o processamento de mensagens do WhatsApp num loop infinito.
const MAX_STEPS_PER_MESSAGE = 25;

// Nunca deixar um node de "delay" travar o recebimento de mensagens por mais
// que isso — fluxos que precisam de esperas reais devem usar o Schedules.
const MAX_DELAY_MS = 15000;

interface ProcessParams {
  ticket: Ticket;
  contact: Contact;
  incomingText: string;
}

interface ProcessResult {
  handled: boolean;
}

const buildInterpolationView = (
  variables: Record<string, any>,
  contact: Contact
): Record<string, any> => {
  const firstName = contact?.name ? contact.name.split(" ")[0] : "";
  return {
    name: contact?.name || "",
    firstName,
    numero: contact?.number || "",
    ...variables
  };
};

const interpolate = (
  text: string | undefined,
  variables: Record<string, any>,
  contact: Contact
): string => {
  if (!text) return "";
  try {
    return Mustache.render(text, buildInterpolationView(variables, contact));
  } catch (err) {
    return text;
  }
};

const findNode = (flow: Flow, nodeId: string | null | undefined): FlowNode | undefined =>
  nodeId ? flow.nodes.find(n => n.id === nodeId) : undefined;

const findNextNode = (
  flow: Flow,
  nodeId: string,
  handle?: string | null
): FlowNode | undefined => {
  const edge = flow.edges.find(
    e => e.source === nodeId && (handle === undefined || e.sourceHandle === handle)
  );
  return edge ? findNode(flow, edge.target) : undefined;
};

const evaluateCondition = (
  variables: Record<string, any>,
  data: { variableName?: string; operator?: string; value?: string }
): boolean => {
  const left = data.variableName ? variables[data.variableName] : undefined;
  const leftStr = left != null ? String(left).trim().toLowerCase() : "";
  const rightStr = (data.value || "").trim().toLowerCase();

  switch (data.operator) {
    case "equals":
      return leftStr === rightStr;
    case "not_equals":
      return leftStr !== rightStr;
    case "contains":
      return leftStr.includes(rightStr);
    case "not_contains":
      return !leftStr.includes(rightStr);
    case "greater_than":
      return parseFloat(leftStr) > parseFloat(rightStr);
    case "less_than":
      return parseFloat(leftStr) < parseFloat(rightStr);
    case "is_empty":
      return leftStr.length === 0;
    case "is_not_empty":
      return leftStr.length > 0;
    default:
      return false;
  }
};

const emitFlowSessionUpdate = (ticket: Ticket, session: FlowSession): void => {
  try {
    const io = getIO();
    io.to(`company-${ticket.companyId}-${ticket.status}`)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-flowSession`, {
        action: "update",
        ticketId: ticket.id,
        status: session.status,
        currentNodeId: session.currentNodeId
      });
  } catch (err) {
    // Socket indisponível não deve derrubar a execução do fluxo.
  }
};

const runHttpRequestNode = async (
  node: FlowNode,
  variables: Record<string, any>,
  contact: Contact
): Promise<void> => {
  const { url, method = "GET", headers, body, saveResponseAs } = node.data || {};
  if (!url) return;

  try {
    const interpolatedUrl = interpolate(url, variables, contact);
    let parsedHeaders: Record<string, string> = {};
    if (headers) {
      try {
        parsedHeaders =
          typeof headers === "string" ? JSON.parse(interpolate(headers, variables, contact)) : headers;
      } catch {
        parsedHeaders = {};
      }
    }

    const init: RequestInit = { method, headers: parsedHeaders };
    if (body && method !== "GET" && method !== "HEAD") {
      const interpolatedBody = interpolate(
        typeof body === "string" ? body : JSON.stringify(body),
        variables,
        contact
      );
      init.body = interpolatedBody;
      if (!parsedHeaders["Content-Type"] && !parsedHeaders["content-type"]) {
        init.headers = { ...parsedHeaders, "Content-Type": "application/json" };
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(interpolatedUrl, { ...init, signal: controller.signal });
    clearTimeout(timeout);

    if (saveResponseAs) {
      const contentType = response.headers.get("content-type") || "";
      variables[saveResponseAs] = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "");
    }
  } catch (err: any) {
    logger.warn(`FlowEngine: falha no node httpRequest (${node.id}): ${err.message}`);
    if (saveResponseAs) {
      variables[saveResponseAs] = null;
    }
  }
};

const runAiPromptNode = async (
  node: FlowNode,
  ticket: Ticket,
  contact: Contact,
  variables: Record<string, any>
): Promise<void> => {
  const { promptId, saveResponseAs, sendAsMessage } = node.data || {};
  if (!promptId) return;

  const prompt = await Prompt.findOne({ where: { id: promptId, companyId: ticket.companyId } });
  if (!prompt) return;

  try {
    const result = await ExecuteAIService({
      prompt,
      ticket,
      contact,
      incomingText: interpolate(node.data?.instruction, variables, contact) || ""
    });

    if (saveResponseAs) {
      variables[saveResponseAs] = result.replyText;
    }

    if (sendAsMessage !== false && result.replyText) {
      await SendWhatsAppMessage({ body: result.replyText, ticket });
    }
  } catch (err: any) {
    logger.warn(`FlowEngine: falha no node aiPrompt (${node.id}): ${err.message}`);
  }
};

/**
 * Motor de execução dos fluxos visuais (equivalente interno ao Typebot/n8n).
 * Processa um passo da conversa por vez: dado um ticket com sessão de fluxo
 * ativa (ou uma fila com um fluxo atrelado), avança pelo grafo de nodes até
 * encontrar um ponto de pausa (node "question", que espera resposta do
 * contato) ou o fim do fluxo.
 */
export const startFlowForTicket = async (
  flow: Flow,
  ticket: Ticket
): Promise<FlowSession> => {
  const startNode = flow.nodes.find(n => n.type === "start") || flow.nodes[0];

  const session = await FlowSession.create({
    flowId: flow.id,
    ticketId: ticket.id,
    companyId: ticket.companyId,
    currentNodeId: startNode?.id || null,
    status: "running",
    variables: {}
  } as FlowSession);

  return session;
};

export const processIncomingMessage = async ({
  ticket,
  contact,
  incomingText
}: ProcessParams): Promise<ProcessResult> => {
  let session = await FlowSession.findOne({
    where: { ticketId: ticket.id, status: ["running", "waiting_input"] },
    order: [["id", "DESC"]]
  });

  if (!session) {
    return { handled: false };
  }

  const flow = await Flow.findByPk(session.flowId);
  if (!flow || !flow.isActive) {
    await session.update({ status: "stopped" });
    return { handled: false };
  }

  const variables = { ...(session.variables || {}) };

  let nextNode: FlowNode | undefined;

  if (session.status === "waiting_input") {
    if (session.waitingVariable) {
      variables[session.waitingVariable] = incomingText;
    }
    nextNode = findNextNode(flow, session.currentNodeId);
  } else {
    nextNode = findNode(flow, session.currentNodeId);
  }

  let steps = 0;
  let finished = false;

  while (nextNode && steps < MAX_STEPS_PER_MESSAGE) {
    steps += 1;
    const node = nextNode;

    switch (node.type) {
      case "start": {
        nextNode = findNextNode(flow, node.id);
        continue;
      }

      case "message": {
        const text = interpolate(node.data?.text, variables, contact);
        if (text) {
          await SendWhatsAppMessage({ body: text, ticket });
        }
        nextNode = findNextNode(flow, node.id);
        continue;
      }

      case "question": {
        const text = interpolate(node.data?.text, variables, contact);
        if (text) {
          await SendWhatsAppMessage({ body: text, ticket });
        }
        await session.update({
          status: "waiting_input",
          currentNodeId: node.id,
          waitingVariable: node.data?.variableName || null,
          variables
        });
        emitFlowSessionUpdate(ticket, session);
        return { handled: true };
      }

      case "condition": {
        const result = evaluateCondition(variables, node.data || {});
        nextNode = findNextNode(flow, node.id, result ? "true" : "false");
        continue;
      }

      case "setVariable": {
        if (node.data?.variableName) {
          variables[node.data.variableName] = interpolate(node.data?.value, variables, contact);
        }
        nextNode = findNextNode(flow, node.id);
        continue;
      }

      case "delay": {
        const ms = Math.min(Number(node.data?.seconds || 0) * 1000, MAX_DELAY_MS);
        if (ms > 0) {
          await new Promise(resolve => setTimeout(resolve, ms));
        }
        nextNode = findNextNode(flow, node.id);
        continue;
      }

      case "httpRequest": {
        await runHttpRequestNode(node, variables, contact);
        nextNode = findNextNode(flow, node.id);
        continue;
      }

      case "aiPrompt": {
        await runAiPromptNode(node, ticket, contact, variables);
        nextNode = findNextNode(flow, node.id);
        continue;
      }

      case "tag": {
        if (node.data?.tagId) {
          await TicketTag.findOrCreate({
            where: { ticketId: ticket.id, tagId: Number(node.data.tagId) }
          });
        }
        nextNode = findNextNode(flow, node.id);
        continue;
      }

      case "transferQueue": {
        if (node.data?.queueId) {
          await UpdateTicketService({
            ticketData: {
              queueId: Number(node.data.queueId),
              useIntegration: false,
              chatbot: false
            },
            ticketId: ticket.id,
            companyId: ticket.companyId
          });
        }
        finished = true;
        nextNode = undefined;
        break;
      }

      case "end":
      default: {
        finished = true;
        nextNode = undefined;
        break;
      }
    }
  }

  if (steps >= MAX_STEPS_PER_MESSAGE && nextNode) {
    logger.warn(`FlowEngine: fluxo ${flow.id} atingiu o limite de passos no ticket ${ticket.id} — parado por segurança.`);
    await session.update({ status: "stopped", variables });
    emitFlowSessionUpdate(ticket, session);
    return { handled: true };
  }

  await session.update({
    status: "completed",
    currentNodeId: null,
    variables
  });
  emitFlowSessionUpdate(ticket, session);

  return { handled: true };
};

/**
 * Chamado bem no início do processamento de cada mensagem recebida (antes de
 * qualquer lógica de fila/IA/integração ser resolvida). Só continua uma
 * sessão de fluxo JÁ em andamento para este ticket — não inicia uma nova.
 * Devolve `false` quando não há sessão ativa, deixando o listener seguir
 * normalmente (é aí que uma fila com fluxo atrelado tem a chance de iniciar
 * uma, via `startFlowFromQueue`, no mesmo ponto onde promptId/integrationId
 * já são checados hoje).
 */
export const handleFlowContinuation = async (
  ticket: Ticket,
  contact: Contact,
  incomingText: string
): Promise<boolean> => {
  try {
    const existingSession = await FlowSession.findOne({
      where: { ticketId: ticket.id, status: ["running", "waiting_input"] }
    });

    if (!existingSession) return false;

    const result = await processIncomingMessage({ ticket, contact, incomingText });
    return result.handled;
  } catch (err: any) {
    logger.error(`FlowEngine: erro continuando fluxo do ticket ${ticket.id}: ${err.message}`);
    return false;
  }
};

/**
 * Chamado nos mesmos pontos onde queue.promptId/queue.integrationId já são
 * checados hoje (ver wbotMessageListener). Se a fila resolvida tiver um
 * fluxo ativo atrelado e o ticket ainda não tiver sessão em andamento, inicia
 * o fluxo do zero e já executa o primeiro passo.
 */
export const startFlowFromQueue = async (
  queue: Queue | null | undefined,
  ticket: Ticket,
  contact: Contact,
  incomingText: string
): Promise<boolean> => {
  try {
    if (!queue?.flowId) return false;

    const existingSession = await FlowSession.findOne({
      where: { ticketId: ticket.id, status: ["running", "waiting_input"] }
    });
    if (existingSession) return false;

    const flow = await Flow.findOne({
      where: { id: queue.flowId, companyId: ticket.companyId, isActive: true }
    });
    if (!flow) return false;

    await startFlowForTicket(flow, ticket);
    const result = await processIncomingMessage({ ticket, contact, incomingText });
    return result.handled;
  } catch (err: any) {
    logger.error(`FlowEngine: erro iniciando fluxo da fila ${queue?.id} no ticket ${ticket.id}: ${err.message}`);
    return false;
  }
};

export default {
  processIncomingMessage,
  startFlowForTicket,
  handleFlowContinuation,
  startFlowFromQueue
};
