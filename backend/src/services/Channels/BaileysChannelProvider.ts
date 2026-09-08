import {
  ChannelProvider,
  ChannelStatus,
  SendMediaInput,
  SendTemplateInput,
  SendTextInput,
  SentMessage
} from "./ChannelProvider";
import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

export class BaileysChannelProvider implements ChannelProvider {
  private whatsappId: number;

  constructor(whatsappId: number) {
    this.whatsappId = whatsappId;
  }

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
      [input.mediaType.startsWith("image") ? "image" : "document"]: { url: input.mediaPath },
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

  async markAsRead(messageId: string): Promise<void> {
    try {
      const wbot = getWbot(this.whatsappId);
      // Optional read receipt
    } catch (err) {
      // ignore
    }
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
