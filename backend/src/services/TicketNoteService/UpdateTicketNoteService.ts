import AppError from "../../errors/AppError";
import TicketNote from "../../models/TicketNote";
import ShowTicketNoteService from "./ShowTicketNoteService";

interface TicketNoteData {
  note: string;
  id?: number | string;
  companyId: number;
}

const UpdateTicketNoteService = async (
  ticketNoteData: TicketNoteData
): Promise<TicketNote> => {
  const { id, note, companyId } = ticketNoteData;

  const ticketNote = await ShowTicketNoteService(id, companyId);

  await ticketNote.update({
    note
  });

  return ticketNote;
};

export default UpdateTicketNoteService;
