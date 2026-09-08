import TicketNote from "../../models/TicketNote";
import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";

const DeleteTicketNoteService = async (
  id: string,
  companyId: number
): Promise<void> => {
  const ticketnote = await TicketNote.findOne({
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

  if (!ticketnote) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  await ticketnote.destroy();
};

export default DeleteTicketNoteService;
