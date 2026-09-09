import { subHours } from "date-fns";
import { Op, UniqueConstraintError } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";

interface TicketData {
  status?: string;
  companyId?: number;
  unreadMessages?: number;
}

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  companyId: number,
  groupContact?: Contact
): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending", "closed"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      companyId,
      whatsappId
    },
    order: [["id", "DESC"]]
  });

  if (ticket) {
    await ticket.update({ unreadMessages, whatsappId });
  }
  
  if (ticket?.status === "closed") {
    await ticket.update({ queueId: null, userId: null });
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages,
        queueId: null,
        companyId
      });
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
    }
    const msgIsGroupBlock = await Setting.findOne({
      where: { key: "timeCreateNewTicket" }
    });
  
    const value = msgIsGroupBlock ? parseInt(msgIsGroupBlock.value, 10) : 7200;
  }

  if (!ticket && !groupContact) {
    ticket = await Ticket.findOne({
      where: {
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        contactId: contact.id
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages,
        queueId: null,
        companyId
      });
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId: ticket.whatsappId,
        userId: ticket.userId
      });
    }
  }
  
    const whatsapp = await Whatsapp.findOne({
    where: { id: whatsappId }
  });

  if (!ticket) {
    const contactId = groupContact ? groupContact.id : contact.id;

    try {
      ticket = await Ticket.create({
        contactId,
        status: "pending",
        isGroup: !!groupContact,
        unreadMessages,
        whatsappId,
        whatsapp,
        companyId
      });
      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId,
        userId: ticket.userId
      });
    } catch (err) {
      // O processamento de mensagens roda em paralelo (várias mensagens do
      // mesmo tick chegam ao mesmo tempo): duas chamadas concorrentes para o
      // mesmo contato podiam ambas passar pelo findOne acima vendo "nenhum
      // ticket" e as duas tentarem criar. A constraint
      // contactid_companyid_unique (Tickets) impede a duplicata no banco,
      // lançando este erro na segunda tentativa — em vez de propagar e
      // descartar a mensagem, buscamos o ticket que a outra chamada acabou
      // de criar e seguimos com ele.
      if (!(err instanceof UniqueConstraintError)) {
        throw err;
      }

      ticket = await Ticket.findOne({
        where: { contactId, companyId, whatsappId },
        order: [["id", "DESC"]]
      });

      if (!ticket) {
        throw err;
      }

      await ticket.update({ unreadMessages, whatsappId });
    }
  }

  ticket = await ShowTicketService(ticket.id, companyId);

  return ticket;
};

export default FindOrCreateTicketService;
