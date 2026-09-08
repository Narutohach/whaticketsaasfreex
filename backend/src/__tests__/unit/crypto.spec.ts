import { encrypt, decrypt } from "../../helpers/crypto";

describe("Crypto Helper", () => {
  it("should correctly encrypt and decrypt a plain text string", () => {
    const secretText = "sk-proj-my-super-secret-api-key-123456789";
    const encrypted = encrypt(secretText);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(secretText);
    expect(encrypted.split(":").length).toBe(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toEqual(secretText);
  });

  it("should return empty string when encrypting/decrypting empty input", () => {
    expect(encrypt("")).toEqual("");
    expect(decrypt("")).toEqual("");
  });

  it("should handle legacy unencrypted strings gracefully", () => {
    const legacyKey = "plain-text-legacy-key";
    const result = decrypt(legacyKey);
    expect(result).toEqual(legacyKey);
  });
});
