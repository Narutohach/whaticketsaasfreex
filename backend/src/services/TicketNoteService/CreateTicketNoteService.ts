import * as Yup from "yup";
import AppError from "../../errors/AppError";
import TicketNote from "../../models/TicketNote";
import Ticket from "../../models/Ticket";

interface TicketNoteData {
  note: string;
  userId: number | string;
  contactId: number | string;
  ticketId: number | string;
  companyId: number;
}

const CreateTicketNoteService = async (
  ticketNoteData: TicketNoteData
): Promise<TicketNote> => {
  const { note, ticketId, companyId } = ticketNoteData;

  const ticketnoteSchema = Yup.object().shape({
    note: Yup.string()
      .min(3, "ERR_TICKETNOTE_INVALID_NAME")
      .required("ERR_TICKETNOTE_INVALID_NAME")
  });

  try {
    await ticketnoteSchema.validate({ note });
  } catch (err) {
    throw new AppError(err.message);
  }

  // Sem esta checagem é possível anexar observações ao ticket de outra empresa.
  const ticket = await Ticket.findOne({
    where: { id: ticketId, companyId }
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const ticketNote = await TicketNote.create({
    note,
    userId: ticketNoteData.userId,
    contactId: ticket.contactId,
    ticketId: ticket.id
  } as TicketNote);

  return ticketNote;
};

export default CreateTicketNoteService;
