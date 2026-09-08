import Prompt from "../models/Prompt";
import Ticket from "../models/Ticket";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";

/**
 * Prioridade de configuração de IA: fila > conexão > padrão da empresa.
 *
 * Antes a conexão sempre vencia (handleOpenAi olhava primeiro
 * `whatsapp.prompt` e só caía pro prompt da fila se a conexão não tivesse
 * nenhum configurado), então uma empresa com IA configurada na conexão nunca
 * conseguia customizar o comportamento por fila — a configuração mais
 * específica era sempre ignorada.
 *
 * Não existe um quarto nível "configuração global": cada empresa usa sua
 * própria chave de API (OpenAI/Gemini), não há credencial compartilhada da
 * plataforma para servir de fallback final.
 */
const ResolveAIPrompt = async (
  whatsappId: number,
  ticket: Ticket
): Promise<Prompt | null> => {
  if (ticket.queue?.prompt) {
    return ticket.queue.prompt;
  }

  const { prompt: connectionPrompt } = await ShowWhatsAppService(
    whatsappId,
    ticket.companyId
  );

  if (connectionPrompt) {
    return connectionPrompt;
  }

  const defaultPrompt = await Prompt.findOne({
    where: { companyId: ticket.companyId, isDefault: true }
  });

  return defaultPrompt;
};

export default ResolveAIPrompt;
