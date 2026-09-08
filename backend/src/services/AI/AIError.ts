export type AIErrorCode =
  | "INVALID_API_KEY"
  | "RATE_LIMITED"
  | "MODEL_NOT_FOUND"
  | "CONTEXT_TOO_LARGE"
  | "SAFETY_BLOCKED"
  | "TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export class AIError extends Error {
  public code: AIErrorCode;
  public originalError?: any;
  public provider: string;

  constructor(message: string, code: AIErrorCode, provider: string, originalError?: any) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.provider = provider;
    this.originalError = originalError;
  }
}
