export type AIMessageRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export interface GenerateTextInput {
  systemPrompt?: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  responseFormat?: "text" | "json";
}

export interface GenerateTextResult {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  model?: string;
}

export type AIProviderName = "openai" | "gemini";

export interface AIProvider {
  name: AIProviderName;
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  generateTextStream?(input: GenerateTextInput): AsyncIterable<string>;
  transcribeAudio?(filePath: string, model?: string): Promise<string>;
}
