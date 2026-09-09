import { Op } from "sequelize";
import { proto } from "@whiskeysockets/baileys";
import InboundMessageBacklog from "../models/InboundMessageBacklog";
import { logger } from "../utils/logger";

/**
 * Antes desta correção, o recebimento de mensagem inteiro vivia num array em
 * memória (`wbotMessageListener`), drenado a cada 100ms. O WhatsApp já
 * considera a mensagem entregue assim que o Baileys a recebe — não existe
 * "não confirmar" para forçar reenvio — então qualquer queda do processo
 * entre o recebimento e o processamento perdia a mensagem em silêncio, sem
 * deixar rastro nenhum.
 *
 * A correção não tenta replay perfeito para todo tipo de mensagem: mídia
 * carrega campos binários (mediaKey, fileEncSha256) que não sobrevivem a um
 * JSON.stringify/parse — tentar reprocessar automaticamente quebraria o
 * download. Para mídia, o que se ganha aqui é visibilidade (o operador
 * descobre que algo pode ter se perdido) em vez de perda totalmente
 * silenciosa. Para texto puro, o reprocessamento automático é seguro e é
 * feito de verdade pela varredura periódica.
 */

const TEXT_MESSAGE_TYPES = new Set(["conversation", "extendedTextMessage"]);

export const isSafelyReplayableType = (messageType: string | undefined): boolean =>
  !!messageType && TEXT_MESSAGE_TYPES.has(messageType);

/**
 * Chamado de forma síncrona, ANTES de qualquer processamento, assim que a
 * mensagem chega. Se isto falhar, a exceção deve propagar — sem o registro
 * durável, seguir processando teria a mesma fragilidade de antes.
 */
export const recordInboundMessageReceived = async (
  message: proto.IWebMessageInfo,
  whatsappId: number,
  companyId: number,
  messageType: string
): Promise<void> => {
  const messageId = message.key.id;

  if (!messageId) {
    return;
  }

  await InboundMessageBacklog.upsert({
    id: messageId,
    whatsappId,
    companyId,
    messageType,
    rawJson: isSafelyReplayableType(messageType)
      ? JSON.stringify(message)
      : null,
    status: "pending",
    attempts: 0,
    lastError: null
  } as InboundMessageBacklog);
};

/**
 * Chamado após o processamento terminar com sucesso. O registro não serve
 * mais para nada depois disso — mantê-lo duplicaria o conteúdo de toda
 * mensagem de texto recebida indefinidamente.
 */
export const markInboundMessageProcessed = async (
  messageId: string | undefined
): Promise<void> => {
  if (!messageId) {
    return;
  }

  await InboundMessageBacklog.destroy({ where: { id: messageId } });
};

export const markInboundMessageFailed = async (
  messageId: string | undefined,
  error: unknown
): Promise<void> => {
  if (!messageId) {
    return;
  }

  try {
    const backlogEntry = await InboundMessageBacklog.findByPk(messageId);

    if (!backlogEntry) {
      return;
    }

    await backlogEntry.update({
      status: "failed",
      attempts: backlogEntry.attempts + 1,
      lastError: (error as Error)?.message || String(error)
    });
  } catch (err) {
    // A gravação da falha é best-effort: nunca pode mascarar o erro original
    // do processamento nem travar o fluxo de mensagens.
    logger.error(
      `InboundMessageDurability: falha ao registrar erro de ${messageId}: ${
        (err as Error)?.message
      }`
    );
  }
};

const STALLED_AFTER_MS = 2 * 60 * 1000;
const MAX_AUTO_RETRY_ATTEMPTS = 5;

/**
 * Varredura periódica (ver queues.ts). Encontra mensagens que ficaram
 * "pending" por tempo demais — sinal de que o processo caiu no meio do
 * processamento — e devolve as de texto puro para reprocessamento pelo
 * chamador. Mensagens de mídia nesse estado só são registradas em log:
 * replay automático arriscaria persistir uma mensagem com mídia corrompida.
 */
export const findStalledInboundMessages = async (): Promise<
  InboundMessageBacklog[]
> => {
  const stalled = await InboundMessageBacklog.findAll({
    where: {
      status: "pending",
      updatedAt: { [Op.lt]: new Date(Date.now() - STALLED_AFTER_MS) },
      attempts: { [Op.lt]: MAX_AUTO_RETRY_ATTEMPTS }
    }
  });

  const nonReplayable = stalled.filter(
    entry => !isSafelyReplayableType(entry.messageType)
  );

  nonReplayable.forEach(entry => {
    logger.warn(
      `InboundMessageDurability: mensagem ${entry.id} (tipo ${entry.messageType}, empresa ${entry.companyId}) ficou pendente por mais de ${
        STALLED_AFTER_MS / 1000
      }s e não é de um tipo reprocessável automaticamente — pode ter sido perdida no recebimento. Verificar manualmente.`
    );
  });

  return stalled.filter(entry => isSafelyReplayableType(entry.messageType));
};
