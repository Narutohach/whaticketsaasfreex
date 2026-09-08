import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import { ChannelProviderFactory } from "../services/Channels/ChannelProviderFactory";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  await ticket.update({ unreadMessages: 0 });

  // A confirmação de leitura no canal (Baileys ou Meta Cloud) é best-effort:
  // se a conexão estiver fora do ar, isso não pode impedir de marcar as
  // mensagens como lidas no banco, que é o que zera o contador na tela.
  try {
    const lastUnreadMessage = await Message.findOne({
      where: {
        ticketId: ticket.id,
        fromMe: false,
        read: false
      },
      order: [["createdAt", "DESC"]]
    });

    if (lastUnreadMessage) {
      const whatsapp =
        ticket.whatsapp ||
        (ticket.whatsappId ? await Whatsapp.findByPk(ticket.whatsappId) : null);

      if (whatsapp) {
        const channel = ChannelProviderFactory.getProvider(whatsapp);
        await channel.markAsRead?.(lastUnreadMessage.id);
      }
    }
  } catch (err) {
    logger.warn(
      `Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`
    );
  }

  await Message.update(
    { read: true },
    {
      where: {
        ticketId: ticket.id,
        read: false
      }
    }
  );

  const io = getIO();
  io.to(`company-${ticket.companyId}-mainchannel`).emit(
    `company-${ticket.companyId}-ticket`,
    {
      action: "updateUnread",
      ticketId: ticket.id
    }
  );
};

export default SetTicketMessagesAsRead;
