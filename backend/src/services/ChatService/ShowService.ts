import Chat from "../../models/Chat";
import AppError from "../../errors/AppError";

const ShowService = async (
  id: string | number,
  companyId: number
): Promise<Chat> => {
  const record = await Chat.findOne({
    where: { id, companyId }
  });

  if (!record) {
    throw new AppError("ERR_NO_CHAT_FOUND", 404);
  }

  return record;
};

export default ShowService;
