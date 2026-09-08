import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";

const ShowMessageService = async (messageId: string, companyId: number) => {
  const message = await Message.findOne({
    where: { id: messageId, companyId }
  });

  return message || undefined;
}

export const GetWhatsAppFromMessage = async (message: Message): Promise<number | null> => {
  const ticketId = message.ticketId;
  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) {
    return null;
  }
  return ticket.whatsappId;
}


export default ShowMessageService;
