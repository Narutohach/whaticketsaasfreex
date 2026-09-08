import { Op } from "sequelize";
import moment from "moment";
import Whatsapp from "../../models/Whatsapp";
import Ticket from "../../models/Ticket";
import TicketTraking from "../../models/TicketTraking";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

const DeleteWhatsAppService = async (id: string): Promise<void> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  const io = getIO();

  const openTickets = await Ticket.findAll({
    where: {
      whatsappId: whatsapp.id,
      status: { [Op.ne]: "closed" }
    }
  });

  for (const ticket of openTickets) {
    const oldStatus = ticket.status;

    await ticket.update({
      status: "closed",
      chatbot: false,
      queueOptionId: null,
      promptId: null,
      integrationId: null,
      useIntegration: false
    });

    await TicketTraking.update(
      { finishedAt: moment().toDate() },
      { where: { ticketId: ticket.id, finishedAt: null } }
    );

    io.to(`company-${ticket.companyId}-${oldStatus}`)
      .to(`queue-${ticket.queueId}-${oldStatus}`)
      .to(`user-${ticket.userId}`)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "delete",
        ticketId: ticket.id
      });
  }

  await whatsapp.destroy();
};

export default DeleteWhatsAppService;
