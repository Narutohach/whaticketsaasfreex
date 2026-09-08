import TicketNote from "../../models/TicketNote";
import Ticket from "../../models/Ticket";

const FindAllTicketNotesService = async (
  companyId: number
): Promise<TicketNote[]> => {
  const ticketNote = await TicketNote.findAll({
    include: [
      {
        model: Ticket,
        as: "ticket",
        attributes: [],
        required: true,
        where: { companyId }
      }
    ]
  });
  return ticketNote;
};

export default FindAllTicketNotesService;
