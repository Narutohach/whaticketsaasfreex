import Whatsapp from "../models/Whatsapp";

/**
 * Campos que NUNCA podem sair num evento de socket:
 *
 * - `token`: é a credencial da API externa e o middleware tokenAuth autentica
 *   só com ela (ver middleware/tokenAuth.ts). Quem obtém o token de uma
 *   conexão consegue enviar WhatsApp em nome daquela empresa.
 * - `session`: credenciais do Baileys — permitem assumir a sessão do número.
 *
 * Até esta correção o objeto Whatsapp inteiro era emitido, e com `io.emit()`
 * (sem sala) o payload chegava a todos os sockets conectados, de todas as
 * empresas.
 */
const SOCKET_FORBIDDEN_FIELDS = ["token", "session"];

export const serializeWhatsappForSocket = (
  whatsapp: Whatsapp | null | undefined
): Record<string, unknown> | null => {
  if (!whatsapp) {
    return null;
  }

  const plain = (
    typeof (whatsapp as Whatsapp).toJSON === "function"
      ? (whatsapp as Whatsapp).toJSON()
      : { ...whatsapp }
  ) as Record<string, unknown>;

  SOCKET_FORBIDDEN_FIELDS.forEach(field => {
    delete plain[field];
  });

  return plain;
};

export default serializeWhatsappForSocket;
