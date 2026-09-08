import {
  sanitizeMetadata,
  REDACTED_VALUE,
  MAX_METADATA_STRING_LENGTH
} from "../../services/AuditServices/CreateAuditLogService";

describe("Audit metadata sanitizer", () => {
  it("should redact sensitive keys regardless of case or naming style", () => {
    const result = sanitizeMetadata({
      password: "123456",
      ApiKey: "sk-proj-abc",
      API_KEY: "sk-proj-def",
      voiceKey: "azure-voice",
      token: "whatsapp-token",
      accessToken: "bearer-xyz",
      clientSecret: "secret",
      client_secret: "secret",
      session: { creds: { me: 1 } },
      keys: ["a", "b"]
    });

    expect(result.password).toEqual(REDACTED_VALUE);
    expect(result.ApiKey).toEqual(REDACTED_VALUE);
    expect(result.API_KEY).toEqual(REDACTED_VALUE);
    expect(result.voiceKey).toEqual(REDACTED_VALUE);
    expect(result.token).toEqual(REDACTED_VALUE);
    expect(result.accessToken).toEqual(REDACTED_VALUE);
    expect(result.clientSecret).toEqual(REDACTED_VALUE);
    expect(result.client_secret).toEqual(REDACTED_VALUE);
    expect(result.session).toEqual(REDACTED_VALUE);
    expect(result.keys).toEqual(REDACTED_VALUE);
  });

  it("should redact sensitive keys inside nested objects", () => {
    const result = sanitizeMetadata({
      connection: {
        name: "Suporte",
        provider: "baileys",
        credentials: {
          token: "abc123",
          openaiApiKey: "sk-proj-nested"
        }
      }
    });

    expect(result.connection.name).toEqual("Suporte");
    expect(result.connection.provider).toEqual("baileys");
    expect(result.connection.credentials.token).toEqual(REDACTED_VALUE);
    expect(result.connection.credentials.openaiApiKey).toEqual(REDACTED_VALUE);
  });

  it("should walk arrays and sanitize the objects inside them", () => {
    const result = sanitizeMetadata({
      prompts: [
        { name: "Vendas", apiKey: "sk-1" },
        { name: "Suporte", apiKey: "sk-2" }
      ]
    });

    expect(result.prompts).toHaveLength(2);
    expect(result.prompts[0].name).toEqual("Vendas");
    expect(result.prompts[0].apiKey).toEqual(REDACTED_VALUE);
    expect(result.prompts[1].name).toEqual("Suporte");
    expect(result.prompts[1].apiKey).toEqual(REDACTED_VALUE);
  });

  it("should truncate long strings", () => {
    const longText = "a".repeat(MAX_METADATA_STRING_LENGTH + 200);

    const result = sanitizeMetadata({ prompt: longText, short: "ok" });

    expect(result.prompt).toEqual(
      `${"a".repeat(MAX_METADATA_STRING_LENGTH)}...`
    );
    expect(result.prompt.length).toEqual(MAX_METADATA_STRING_LENGTH + 3);
    expect(result.short).toEqual("ok");
  });

  it("should keep non-sensitive fields untouched", () => {
    const metadata = {
      name: "Empresa Teste",
      email: "admin@empresa.com",
      planId: 3,
      status: true,
      changedFields: ["name", "email"],
      dueDate: "2026-01-01"
    };

    const result = sanitizeMetadata(metadata);

    expect(result).toEqual(metadata);
  });

  it("should return null for empty or invalid metadata", () => {
    expect(sanitizeMetadata(null)).toBeNull();
    expect(sanitizeMetadata(undefined)).toBeNull();
  });
});
