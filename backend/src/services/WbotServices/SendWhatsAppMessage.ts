import * as Sentry from "@sentry/node";
import { WAMessage } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { ChannelProviderFactory } from "../Channels/ChannelProviderFactory";

import formatBody from "../../helpers/Mustache";
import { map_msg } from "../../utils/global";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  isForwarded?: boolean;  
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  isForwarded = false
}: Request): Promise<any> => {
  let whatsapp = ticket.whatsapp;
  if (!whatsapp && ticket.whatsappId) {
    whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
  }

  const formattedBody = formatBody(body, ticket.contact);

  // If connection is official Meta Cloud API, dispatch via ChannelProvider
  if (whatsapp && (whatsapp.provider === "meta_cloud" || whatsapp.provider === "meta")) {
    try {
      const channel = ChannelProviderFactory.getProvider(whatsapp);
      const sent = await channel.sendText({
        to: ticket.contact.number,
        body: formattedBody,
        quotedMsgId: quotedMsg?.dataJson ? JSON.parse(quotedMsg.dataJson)?.key?.id : undefined
      });
      await ticket.update({ lastMessage: formattedBody });
      return {
        key: {
          id: sent.id,
          remoteJid: `${ticket.contact.number}@s.whatsapp.net`,
          fromMe: true
        },
        message: {
          conversation: formattedBody
        }
      };
    } catch (err) {
      Sentry.captureException(err);
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }
  }

  // Otherwise, use Baileys
  let options = {};
  const wbot = await GetTicketWbot(ticket);
  const jidServer = ticket.isGroup
    ? "g.us"
    : ticket.contact.isLid
      ? "lid"
      : "s.whatsapp.net";
  const number = `${ticket.contact.number}@${jidServer}`;

  if (quotedMsg) {
    const chatMessages = await Message.findOne({
      where: {
        id: quotedMsg.id
      }
    });

    if (chatMessages) {
      const msgFound = JSON.parse(chatMessages.dataJson);

      options = {
        quoted: {
          key: msgFound.key,
          message: {
            extendedTextMessage: msgFound.message.extendedTextMessage
          }
        }
      };
    }
  }

  try {
    map_msg.set(ticket.contact.number, { lastSystemMsg: body });
    const sentMessage = await wbot.sendMessage(number, {
      text: formattedBody,
      contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded ? true : false }
    },
      {
        ...options
      }
    );
    await ticket.update({ lastMessage: formattedBody });
    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
