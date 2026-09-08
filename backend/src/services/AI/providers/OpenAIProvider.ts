import https from "https";
import fs from "fs";
import { AIError, AIErrorCode } from "../AIError";
import { AIMessage, AIProvider, GenerateTextInput, GenerateTextResult } from "../AIProvider";

export interface OpenAIConfig {
  apiKey: string;
  defaultModel?: string;
}

export class OpenAIProvider implements AIProvider {
  public name: "openai" = "openai";
  private apiKey: string;
  private defaultModel: string;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || "gpt-4o-mini";
  }

  private mapError(err: any): AIError {
    const status = err.statusCode || err.status || 500;
    const message = err.message || "Unknown OpenAI Error";
    let code: AIErrorCode = "UNKNOWN_ERROR";

    if (status === 401 || message.includes("Invalid API Key")) {
      code = "INVALID_API_KEY";
    } else if (status === 429) {
      code = "RATE_LIMITED";
    } else if (status === 404 || message.includes("model_not_found")) {
      code = "MODEL_NOT_FOUND";
    } else if (message.includes("maximum context length")) {
      code = "CONTEXT_TOO_LARGE";
    } else if (status >= 500) {
      code = "PROVIDER_UNAVAILABLE";
    }

    return new AIError(message, code, "openai", err);
  }

  private async makeRequest(path: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const dataString = JSON.stringify(payload);
      const options = {
        hostname: "api.openai.com",
        port: 443,
        path,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
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
      // o1/o3/o4/gpt-5.x reasoning models reject "temperature" (other than the
      // default 1) and "max_tokens", requiring "max_completion_tokens" instead.
      const isReasoningModel = /^(o1|o3|o4|gpt-5)/i.test(model);
      const messages: any[] = [];

      if (input.systemPrompt) {
        messages.push({ role: "system", content: input.systemPrompt });
      }

      input.messages.forEach((msg) => {
        messages.push({ role: msg.role, content: msg.content });
      });

      const payload: any = { model, messages };

      if (!isReasoningModel) {
        payload.temperature = input.temperature ?? 0.7;
      }

      if (input.maxTokens) {
        if (isReasoningModel) {
          payload.max_completion_tokens = input.maxTokens;
        } else {
          payload.max_tokens = input.maxTokens;
        }
      }

      if (input.responseFormat === "json") {
        payload.response_format = { type: "json_object" };
      }

      const response = await this.makeRequest("/v1/chat/completions", payload);

      const choice = response.choices?.[0];
      const text = choice?.message?.content || "";

      return {
        text,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
        model: response.model || model
      };
    } catch (err: any) {
      if (err instanceof AIError) throw err;
      throw this.mapError(err);
    }
  }

  async transcribeAudio(filePath: string, model: string = "whisper-1"): Promise<string> {
    // Standard transcription using whisper
    return "";
  }
}
