import https from "https";
import {
  ChannelProvider,
  ChannelStatus,
  SendMediaInput,
  SendTemplateInput,
  SendTextInput,
  SentMessage
} from "./ChannelProvider";
import AppError from "../../errors/AppError";

export interface MetaCloudConfig {
  phoneNumberId: string;
  wabaId?: string;
  accessToken: string;
  apiVersion?: string;
}

export class MetaCloudApiChannelProvider implements ChannelProvider {
  private phoneNumberId: string;
  private wabaId?: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(config: MetaCloudConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.wabaId = config.wabaId;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || "v20.0";
  }

  private async request(endpoint: string, method: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const payload = data ? JSON.stringify(data) : null;
      const options = {
        hostname: "graph.facebook.com",
        port: 443,
        path: `/${this.apiVersion}/${endpoint}`,
        method,
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {})
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = responseBody ? JSON.parse(responseBody) : {};
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(
                new AppError(
                  parsed.error?.message || `Meta Cloud API error (${res.statusCode})`,
                  res.statusCode || 500
                )
              );
            }
          } catch (e) {
            reject(new AppError(`Invalid response from Meta API: ${responseBody}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(new AppError(`Network error with Meta API: ${error.message}`));
      });

      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  async sendText(input: SendTextInput): Promise<SentMessage> {
    const cleanNumber = input.to.replace(/\D/g, "");
    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanNumber,
      type: "text",
      text: {
        preview_url: false,
        body: input.body
      }
    };

    if (input.quotedMsgId) {
      body.context = {
        message_id: input.quotedMsgId
      };
    }

    const response = await this.request(`${this.phoneNumberId}/messages`, "POST", body);
    const messageId = response.messages?.[0]?.id || "";

    return {
      id: messageId,
      status: "SENT",
      timestamp: Date.now(),
      channelMessageId: messageId
    };
  }

  async sendMedia(input: SendMediaInput): Promise<SentMessage> {
    const cleanNumber = input.to.replace(/\D/g, "");
    const type = input.mediaType.startsWith("image")
      ? "image"
      : input.mediaType.startsWith("video")
      ? "video"
      : input.mediaType.startsWith("audio")
      ? "audio"
      : "document";

    const body: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanNumber,
      type,
      [type]: {
        link: input.mediaPath,
        ...(input.caption ? { caption: input.caption } : {}),
        ...(input.filename && type === "document" ? { filename: input.filename } : {})
      }
    };

    const response = await this.request(`${this.phoneNumberId}/messages`, "POST", body);
    const messageId = response.messages?.[0]?.id || "";

    return {
      id: messageId,
      status: "SENT",
      timestamp: Date.now(),
      channelMessageId: messageId
    };
  }

  async sendTemplate(input: SendTemplateInput): Promise<SentMessage> {
    const cleanNumber = input.to.replace(/\D/g, "");
    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanNumber,
      type: "template",
      template: {
        name: input.templateName,
        language: {
          code: input.language
        },
        components: input.components || []
      }
    };

    const response = await this.request(`${this.phoneNumberId}/messages`, "POST", body);
    const messageId = response.messages?.[0]?.id || "";

    return {
      id: messageId,
      status: "SENT",
      timestamp: Date.now(),
      channelMessageId: messageId
    };
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.request(`${this.phoneNumberId}/messages`, "POST", {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId
    });
  }

  async getStatus(): Promise<ChannelStatus> {
    try {
      const response = await this.request(this.phoneNumberId, "GET");
      if (response && response.id) {
        return "CONNECTED";
      }
      return "DISCONNECTED";
    } catch (err) {
      return "ERROR";
    }
  }

  async fetchTemplates(): Promise<any[]> {
    if (!this.wabaId) {
      throw new AppError("WABA ID não configurado para esta conexão Meta Cloud", 400);
    }
    const response = await this.request(`${this.wabaId}/message_templates`, "GET");
    return response.data || [];
  }
}
