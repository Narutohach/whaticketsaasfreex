import { proto } from "@whiskeysockets/baileys";
import { getWbot } from "../../libs/wbot";
import { handleMessage } from "./wbotMessageListener";
import {
  findStalledInboundMessages,
  markInboundMessageFailed,
  markInboundMessageProcessed
} from "../../helpers/InboundMessageDurability";
import { logger } from "../../utils/logger";

/**
 * Varredura periódica (agendada em server.ts) que reprocessa mensagens de
 * texto que ficaram presas em "pending" — sinal de que o processo caiu
 * durante o processamento original. Ver helpers/InboundMessageDurability.ts
 * para o porquê de mídia não entrar aqui.
 *
 * Arquivo separado de wbotMessageListener.ts para não criar import circular:
 * wbotMessageListener já importa de queues.ts, e queues.ts é onde os outros
 * crons do projeto vivem.
 */
export const recoverStalledInboundMessages = async (): Promise<void> => {
  const stalled = await findStalledInboundMessages();

  if (stalled.length === 0) {
    return;
  }

  logger.info(
    `RecoverStalledInboundMessages: reprocessando ${stalled.length} mensagem(ns) presa(s)`
  );

  await Promise.all(
    stalled.map(async entry => {
      try {
        const wbot = getWbot(entry.whatsappId);
        const message: proto.IWebMessageInfo = JSON.parse(entry.rawJson);

        await handleMessage(message, wbot, entry.companyId);
        await markInboundMessageProcessed(entry.id);
      } catch (err) {
        // Sessão ainda não disponível (ex.: reconectando) é o caso mais
        // comum aqui — a próxima varredura tenta de novo, até o limite de
        // tentativas em findStalledInboundMessages.
        await markInboundMessageFailed(entry.id, err);
      }
    })
  );
};
