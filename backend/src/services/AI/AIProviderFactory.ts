import { AIProvider, AIProviderName } from "./AIProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import { decrypt } from "../../helpers/crypto";
import AppError from "../../errors/AppError";

export interface AIProviderOptions {
  provider: AIProviderName | string;
  apiKey: string;
  model?: string;
}

export class AIProviderFactory {
  static create(options: AIProviderOptions): AIProvider {
    const rawApiKey = options.apiKey ? decrypt(options.apiKey) : "";
    if (!rawApiKey) {
      throw new AppError("ERR_AI_API_KEY_REQUIRED");
    }

    const providerType = (options.provider || "openai").toLowerCase();

    switch (providerType) {
      case "gemini":
      case "google":
        return new GeminiProvider({
          apiKey: rawApiKey,
          defaultModel: options.model || "gemini-1.5-flash"
        });

      case "openai":
      default:
        return new OpenAIProvider({
          apiKey: rawApiKey,
          defaultModel: options.model || "gpt-4o-mini"
        });
    }
  }
}
