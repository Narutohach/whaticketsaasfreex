import { AIProviderFactory } from "../../services/AI/AIProviderFactory";
import { OpenAIProvider } from "../../services/AI/providers/OpenAIProvider";
import { GeminiProvider } from "../../services/AI/providers/GeminiProvider";
import { encrypt } from "../../helpers/crypto";

describe("AIProviderFactory", () => {
  it("should instantiate OpenAIProvider correctly", () => {
    const rawKey = "sk-proj-test-key";
    const encryptedKey = encrypt(rawKey);

    const provider = AIProviderFactory.create({
      provider: "openai",
      apiKey: encryptedKey,
      model: "gpt-4o-mini"
    });

    expect(provider).toBeInstanceOf(OpenAIProvider);
    expect(provider.name).toBe("openai");
  });

  it("should instantiate GeminiProvider correctly", () => {
    const rawKey = "AIzaSy-gemini-test-key";
    const encryptedKey = encrypt(rawKey);

    const provider = AIProviderFactory.create({
      provider: "gemini",
      apiKey: encryptedKey,
      model: "gemini-1.5-flash"
    });

    expect(provider).toBeInstanceOf(GeminiProvider);
    expect(provider.name).toBe("gemini");
  });

  it("should throw AppError if apiKey is missing or empty", () => {
    expect(() => {
      AIProviderFactory.create({
        provider: "openai",
        apiKey: ""
      });
    }).toThrow();
  });
});
