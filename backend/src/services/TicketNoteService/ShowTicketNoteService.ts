import TicketNote from "../../models/TicketNote";
import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";

/**
 * `TicketNotes` não tem coluna `companyId`: o isolamento é feito por join
 * obrigatório com o ticket, que é quem pertence à empresa.
 */
const ShowTicketNoteService = async (
  id: string | number,
  companyId: number
): Promise<TicketNote> => {
  const ticketNote = await TicketNote.findOne({
    where: { id },
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

  if (!ticketNote) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  return ticketNote;
};

export default ShowTicketNoteService;
