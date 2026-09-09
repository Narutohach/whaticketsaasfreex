import serializeWhatsappForSocket from "../../helpers/SerializeWhatsappForSocket";

/**
 * Regressão do vazamento cross-tenant: o objeto Whatsapp inteiro era emitido
 * no socket e, como os emits usavam `io.emit()` (sem sala), o payload chegava
 * a todos os sockets conectados de todas as empresas. Como o middleware
 * tokenAuth autentica só com `token`, quem capturasse o payload de outra
 * empresa conseguia enviar WhatsApp em nome dela.
 */
describe("serializeWhatsappForSocket", () => {
  const buildWhatsapp = (extra = {}) =>
    ({
      id: 1,
      name: "Conexão principal",
      status: "CONNECTED",
      qrcode: "data:image/png;base64,abc",
      number: "5511999999999",
      companyId: 7,
      token: "token-secreto-da-api",
      session: '{"creds":{"noiseKey":"..."}}',
      ...extra,
      toJSON() {
        const { toJSON, ...rest } = this as any;
        return rest;
      }
    }) as any;

  it("never leaks the external API token", () => {
    const result = serializeWhatsappForSocket(buildWhatsapp());

    expect(result).not.toHaveProperty("token");
  });

  it("never leaks the Baileys session credentials", () => {
    const result = serializeWhatsappForSocket(buildWhatsapp());

    expect(result).not.toHaveProperty("session");
  });

  it("keeps the fields the interface actually needs", () => {
    const result = serializeWhatsappForSocket(buildWhatsapp());

    expect(result).toMatchObject({
      id: 1,
      name: "Conexão principal",
      status: "CONNECTED",
      number: "5511999999999",
      companyId: 7
    });
  });

  // O QR code precisa continuar saindo: é o que a tela de conexões renderiza.
  it("keeps the qrcode", () => {
    const result = serializeWhatsappForSocket(buildWhatsapp());

    expect(result).toHaveProperty("qrcode");
  });

  it("handles a plain object without toJSON", () => {
    const result = serializeWhatsappForSocket({
      id: 2,
      companyId: 9,
      token: "outro-token",
      session: "creds"
    } as any);

    expect(result).not.toHaveProperty("token");
    expect(result).not.toHaveProperty("session");
    expect(result).toMatchObject({ id: 2, companyId: 9 });
  });

  it("returns null for null/undefined", () => {
    expect(serializeWhatsappForSocket(null)).toBeNull();
    expect(serializeWhatsappForSocket(undefined)).toBeNull();
  });
});
