import { Chat } from "@whiskeysockets/baileys";
import BaileysChats from "../../models/BaileysChats";

const toNumber = (value: number | { toNumber(): number } | null | undefined): number | undefined => {
  if (value == null) return undefined;
  return typeof value === "number" ? value : value.toNumber();
};

export const CreateOrUpdateBaileysChatService = async (
  whatsappId: number,
  chat: Partial<Chat>,
): Promise<BaileysChats> => {
  const { id, conversationTimestamp, unreadCount } = chat;
  const conversationTimestampNumber = toNumber(conversationTimestamp);
  const baileysChat = await BaileysChats.findOne({
    where: {
      whatsappId,
      jid: id,
    }
  });

  if (baileysChat) {
    const baileysChats = await baileysChat.update({
      conversationTimestamp: conversationTimestampNumber,
      unreadCount: unreadCount ? baileysChat.unreadCount + unreadCount : 0
    });

    return baileysChats;
  }
  // timestamp now

  const timestamp = new Date().getTime();

  const baileysChats = await BaileysChats.create({
    whatsappId,
    jid: id,
    conversationTimestamp: conversationTimestampNumber || timestamp,
    unreadCount: unreadCount || 1,
  });

  return baileysChats;
};
