import { AIMessage } from "./AIProvider";
import { AIProviderFactory } from "./AIProviderFactory";
import Prompt from "../../models/Prompt";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import { logger } from "../../utils/logger";

interface ExecuteAIParams {
  prompt: Prompt;
  ticket: Ticket;
  contact: Contact;
  incomingText: string;
}

export interface ExecuteAIResult {
  replyText: string;
  action?: "transfer_queue" | "close_ticket" | "none";
  queueId?: number;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9À-ÿ ]/g, "").trim();
}

export const ExecuteAIService = async ({
  prompt,
  ticket,
  contact,
  incomingText
}: ExecuteAIParams): Promise<ExecuteAIResult> => {
  try {
    const company = await Company.findByPk(ticket.companyId, {
      include: [{ model: Plan, as: "plan" }]
    });

    if (company && company.status === false) {
      logger.warn(`Company ${ticket.companyId} is inactive, skipping AI response.`);
      return { replyText: "", action: "transfer_queue", queueId: prompt.queueId };
    }

    if (company?.plan?.maxTokensMonthly) {
      // O limite é da empresa, não de um prompt isolado: comparar só contra
      // prompt.totalTokens permitia burlar o teto do plano criando um prompt
      // por fila, já que cada um tinha seu próprio contador independente.
      const usedTokens =
        (await Prompt.sum("totalTokens", {
          where: { companyId: ticket.companyId }
        })) || 0;

      if (usedTokens >= company.plan.maxTokensMonthly) {
        logger.warn(`Company ${ticket.companyId} exceeded AI token limit (${usedTokens}/${company.plan.maxTokensMonthly})`);
        return {
          replyText: "Limite de atendimento automatizado atingido para este período. Transferindo para nossa equipe...",
          action: "transfer_queue",
          queueId: prompt.queueId
        };
      }
    }

    const provider = AIProviderFactory.create({
      provider: prompt.provider || "openai",
      apiKey: prompt.apiKey,
      model: prompt.model || (prompt.provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini")
    });

    const clientName = sanitizeName(contact.name || "Cliente");

    const systemPrompt = `Você é um assistente virtual profissional atendendo ${clientName}.\n
Instruções:
- Identifique o cliente com o nome ${clientName} quando for pertinente e educado.
- Responda de forma clara, prestativa e concisa.
- Suas respostas devem respeitar o limite de ${prompt.maxTokens || 200} tokens.
- Se a solicitação do cliente requerer transferência para outro setor/fila de atendimento humano, inclua no início da mensagem a instrução "[AÇÃO: TRANSFERIR_FILA]".
- Se o atendimento estiver 100% concluído e o cliente se despedir ou agradecer, inclua no início da mensagem "[AÇÃO: FECHAR_TICKET]".
- Regras adicionais da empresa:
${prompt.prompt || ""}
`;

    // Fetch conversation history
    const historyLimit = prompt.maxMessages || 10;
    const previousMessages = await Message.findAll({
      where: { ticketId: ticket.id },
      order: [["createdAt", "DESC"]],
      limit: historyLimit
    });

    // Sort chronologically (ASC)
    const sortedMessages = previousMessages.reverse();

    const messages: AIMessage[] = [];

    sortedMessages.forEach((msg) => {
      if (msg.body && !msg.mediaType?.startsWith("application")) {
        messages.push({
          role: msg.fromMe ? "assistant" : "user",
          content: msg.body
        });
      }
    });

    // Add current incoming message if not already added
    if (incomingText) {
      messages.push({
        role: "user",
        content: incomingText
      });
    }

    const response = await provider.generateText({
      systemPrompt,
      messages,
      temperature: prompt.temperature ?? 0.7,
      maxTokens: prompt.maxTokens || 300
    });

    // Update tokens counters asynchronously
    if (response.totalTokens) {
      Prompt.increment(
        {
          promptTokens: response.promptTokens || 0,
          completionTokens: response.completionTokens || 0,
          totalTokens: response.totalTokens || 0
        },
        { where: { id: prompt.id } }
      ).catch((err) => logger.error(`Error updating token usage: ${err.message}`));
    }

    let reply = response.text.trim();
    let action: "transfer_queue" | "close_ticket" | "none" = "none";
    let targetQueueId: number | undefined = undefined;

    if (
      reply.includes("[AÇÃO: TRANSFERIR_FILA]") ||
      reply.includes("Ação: Transferir para o setor de atendimento") ||
      reply.includes("[ACTION: TRANSFER_QUEUE]")
    ) {
      action = "transfer_queue";
      targetQueueId = prompt.queueId;
      reply = reply
        .replace("[AÇÃO: TRANSFERIR_FILA]", "")
        .replace("Ação: Transferir para o setor de atendimento", "")
        .replace("[ACTION: TRANSFER_QUEUE]", "")
        .trim();
    } else if (
      reply.includes("[AÇÃO: FECHAR_TICKET]") ||
      reply.includes("[ACTION: CLOSE_TICKET]")
    ) {
      action = "close_ticket";
      reply = reply
        .replace("[AÇÃO: FECHAR_TICKET]", "")
        .replace("[ACTION: CLOSE_TICKET]", "")
        .trim();
    }

    return {
      replyText: reply,
      action,
      queueId: targetQueueId
    };
  } catch (err: any) {
    logger.error(`ExecuteAIService error: ${err.message}`);
    throw err;
  }
};
