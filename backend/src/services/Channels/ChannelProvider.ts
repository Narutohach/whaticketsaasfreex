export interface SendTextInput {
  to: string;
  body: string;
  quotedMsgId?: string;
}

export interface SendMediaInput {
  to: string;
  mediaPath: string;
  mediaType: string;
  caption?: string;
  filename?: string;
}

export interface SendTemplateInput {
  to: string;
  templateName: string;
  language: string;
  components?: any[];
}

export interface SentMessage {
  id: string;
  status: string;
  timestamp: number;
  channelMessageId?: string;
}

export type ChannelStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "PAIRING"
  | "ERROR"
  | "TIMEOUT";

export interface ChannelProvider {
  sendText(input: SendTextInput): Promise<SentMessage>;
  sendMedia(input: SendMediaInput): Promise<SentMessage>;
  sendTemplate?(input: SendTemplateInput): Promise<SentMessage>;
  markAsRead?(messageId: string): Promise<void>;
  getStatus(): Promise<ChannelStatus>;
}
