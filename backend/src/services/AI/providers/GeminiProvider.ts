import https from "https";
import { AIError, AIErrorCode } from "../AIError";
import { AIMessage, AIProvider, GenerateTextInput, GenerateTextResult } from "../AIProvider";

export interface GeminiConfig {
  apiKey: string;
  defaultModel?: string;
}

export class GeminiProvider implements AIProvider {
  public name: "gemini" = "gemini";
  private apiKey: string;
  private defaultModel: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || "gemini-1.5-flash";
  }

  private mapError(err: any): AIError {
    const status = err.statusCode || err.status || 500;
    const message = err.message || "Unknown Gemini Error";
    let code: AIErrorCode = "UNKNOWN_ERROR";

    if (status === 400 && message.includes("API_KEY_INVALID")) {
      code = "INVALID_API_KEY";
    } else if (status === 429 || message.includes("RESOURCE_EXHAUSTED")) {
      code = "RATE_LIMITED";
    } else if (status === 404 || message.includes("models/")) {
      code = "MODEL_NOT_FOUND";
    } else if (message.includes("SAFETY")) {
      code = "SAFETY_BLOCKED";
    } else if (status >= 500) {
      code = "PROVIDER_UNAVAILABLE";
    }

    return new AIError(message, code, "gemini", err);
  }

  private async makeRequest(model: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const dataString = JSON.stringify(payload);
      const options = {
        hostname: "generativelanguage.googleapis.com",
        port: 443,
        path: `/v1beta/models/${model}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(dataString)
        }
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(this.mapError({ statusCode: res.statusCode, message: parsed.error?.message || body }));
            }
          } catch (e) {
            reject(this.mapError({ statusCode: res.statusCode, message: body }));
          }
        });
      });

      req.on("error", (err) => reject(this.mapError(err)));
      req.write(dataString);
      req.end();
    });
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    try {
      const model = input.model || this.defaultModel;

      const contents: any[] = [];

      input.messages.forEach((msg) => {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      });

      const payload: any = {
        contents,
        generationConfig: {
          temperature: input.temperature ?? 0.7
        }
      };

      if (input.maxTokens) {
        payload.generationConfig.maxOutputTokens = input.maxTokens;
      }

      if (input.responseFormat === "json") {
        payload.generationConfig.responseMimeType = "application/json";
      }

      if (input.systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: input.systemPrompt }]
        };
      }

      const response = await this.makeRequest(model, payload);

      const candidate = response.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || "";

      const promptTokens = response.usageMetadata?.promptTokenCount || 0;
      const completionTokens = response.usageMetadata?.candidatesTokenCount || 0;
      const totalTokens = response.usageMetadata?.totalTokenCount || promptTokens + completionTokens;

      return {
        text,
        promptTokens,
        completionTokens,
        totalTokens,
        model
      };
    } catch (err: any) {
      if (err instanceof AIError) throw err;
      throw this.mapError(err);
    }
  }
}
