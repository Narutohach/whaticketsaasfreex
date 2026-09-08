import { proto, WASocket } from "@whiskeysockets/baileys";
import {
  ChannelProvider,
  ChannelStatus,
  SendMediaInput,
  SendTemplateInput,
  SendTextInput,
  SentMessage
} from "./ChannelProvider";
import { getWbot } from "../../libs/wbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

export class BaileysChannelProvider implements ChannelProvider {
  private whatsappId: number;

  constructor(whatsappId: number) {
    this.whatsappId = whatsappId;
  }

  /**
   * Envio simplificado, usado hoje só por quem chama o ChannelProvider
   * genericamente (ex.: checagem de status/testes). O fluxo real de resposta
   * de ticket (SendWhatsAppMessage/SendWhatsAppMedia) mantém a lógica própria
   * do Baileys — jid de grupo/lid, citação de mensagem, encaminhamento — que
   * não cabe na interface genérica de ChannelProvider sem perder informação.
   */
  async sendText(input: SendTextInput): Promise<SentMessage> {
    const wbot = getWbot(this.whatsappId);
    const jid = `${input.to.replace(/\D/g, "")}@s.whatsapp.net`;

    const sent = await wbot.sendMessage(jid, {
      text: input.body
    });

    return {
      id: sent.key.id || "",
      status: "SENT",
      timestamp: Date.now(),
      channelMessageId: sent.key.id
    };
  }

  async sendMedia(input: SendMediaInput): Promise<SentMessage> {
    const wbot = getWbot(this.whatsappId);
    const jid = `${input.to.replace(/\D/g, "")}@s.whatsapp.net`;

    // Send media using Baileys socket directly
    const sent = await wbot.sendMessage(jid, {
      [input.mediaType.startsWith("image") ? "image" : "document"]: {
        url: input.mediaPath
      },
      caption: input.caption,
      fileName: input.filename
    } as any);

    return {
      id: sent?.key?.id || "",
      status: "SENT",
      timestamp: Date.now(),
      channelMessageId: sent?.key?.id
    };
  }

  async sendTemplate(input: SendTemplateInput): Promise<SentMessage> {
    // Baileys doesn't have native official templates, fall back to plain text
    return this.sendText({
      to: input.to,
      body: `Template: ${input.templateName}`
    });
  }

  /**
   * `messageId` é o id da própria mensagem (Message.id é o wamid, não um
   * autoincrement — ver models/Message.ts), então dá pra recarregar a
   * mensagem local e montar o `lastMessages` que o Baileys espera para o
   * `chatModify`. Antes este método não fazia nada.
   */
  async markAsRead(messageId: string): Promise<void> {
    const message = await Message.findByPk(messageId, {
      include: [{ model: Ticket, as: "ticket", include: ["contact"] }]
    });

    if (!message?.dataJson || !message.ticket?.contact) {
      return;
    }

    const wbot = getWbot(this.whatsappId);
    const lastMessage: proto.IWebMessageInfo = JSON.parse(message.dataJson);

    if (!lastMessage.key || lastMessage.key.fromMe) {
      return;
    }

    const jid = `${message.ticket.contact.number}@${
      message.ticket.isGroup ? "g.us" : "s.whatsapp.net"
    }`;

    await (wbot as WASocket).chatModify(
      { markRead: true, lastMessages: [lastMessage] },
      jid
    );
  }

  async getStatus(): Promise<ChannelStatus> {
    try {
      const wbot = getWbot(this.whatsappId);
      if (wbot && wbot.user) {
        return "CONNECTED";
      }
      return "DISCONNECTED";
    } catch (err) {
      return "DISCONNECTED";
    }
  }
}
