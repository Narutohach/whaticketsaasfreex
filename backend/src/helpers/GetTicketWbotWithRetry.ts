import { WASocket } from "@whiskeysockets/baileys";
import Ticket from "../models/Ticket";
import GetTicketWbot from "./GetTicketWbot";
import { calculateReconnectDelay } from "./ReconnectBackoff";
import { logger } from "../utils/logger";

const MAX_ATTEMPTS = 3;

/**
 * `GetTicketWbot` lança ERR_WAPP_NOT_INITIALIZED sempre que a sessão não está
 * no array em memória de libs/wbot.ts — inclusive durante a janela normal de
 * reconexão (poucos segundos após uma queda de rede breve). Sem retry, toda
 * mensagem de agente enviada nesses segundos falhava e nunca existia — o
 * atendente via erro e tinha que reenviar manualmente.
 *
 * Usado só nos dois pontos de envio (SendWhatsAppMessage/SendWhatsAppMedia):
 * os outros chamadores de GetTicketWbot (editar, apagar, reagir a mensagem
 * existente) devem continuar falhando rápido — não faz sentido travar por
 * segundos uma ação sobre uma mensagem que já foi enviada.
 *
 * Só 3 tentativas com backoff curto (~2s, ~4s): isso é uma chamada HTTP
 * síncrona, o atendente está esperando a resposta. Uma reconexão que não se
 * resolve em poucos segundos deve aparecer como erro de verdade, não travar
 * a requisição por muito mais tempo que isso.
 */
const GetTicketWbotWithRetry = async (
  ticket: Ticket,
  maxAttempts: number = MAX_ATTEMPTS
): Promise<WASocket> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return (await GetTicketWbot(ticket)) as unknown as WASocket;
    } catch (err) {
      lastError = err;

      if (attempt < maxAttempts - 1) {
        const delay = calculateReconnectDelay(attempt);
        logger.warn(
          `GetTicketWbotWithRetry: sessão do whatsapp ${ticket.whatsappId} indisponível (tentativa ${
            attempt + 1
          }/${maxAttempts}), tentando de novo em ${delay}ms`
        );
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export default GetTicketWbotWithRetry;
