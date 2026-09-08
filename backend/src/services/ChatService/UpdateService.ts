import Chat from "../../models/Chat";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface ChatData {
  id: number;
  title?: string;
  users?: any[];
  companyId: number;
}

export default async function UpdateService(data: ChatData) {
  const { users, companyId } = data;
  const record = await Chat.findOne({
    where: { id: data.id, companyId },
    include: [{ model: ChatUser, as: "users" }]
  });

  if (!record) {
    throw new AppError("ERR_NO_CHAT_FOUND", 404);
  }

  const { ownerId } = record;

  await record.update({ title: data.title });

  if (Array.isArray(users)) {
    await ChatUser.destroy({ where: { chatId: record.id } });
    await ChatUser.create({ chatId: record.id, userId: ownerId });
    for (let user of users) {
      if (user.id !== ownerId) {
        await ChatUser.create({ chatId: record.id, userId: user.id });
      }
    }
  }

  await record.reload({
    include: [
      { model: ChatUser, as: "users", include: [{ model: User, as: "user" }] },
      { model: User, as: "owner" }
    ]
  });

  return record;
}
