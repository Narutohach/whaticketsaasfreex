import { isPublicSettingKey } from "../../helpers/PublicSettings";

describe("isPublicSettingKey", () => {
  it("allows the keys the login and signup screens need before there is a token", () => {
    expect(isPublicSettingKey("allowregister")).toBe(true);
    expect(isPublicSettingKey("viewregister")).toBe(true);
    expect(isPublicSettingKey("trial")).toBe(true);
  });

  // A tabela Settings guarda credenciais de integração por empresa. Estas eram
  // legíveis sem autenticação via GET /settings/:key?companyId=N.
  it.each([
    "asaas",
    "tokenixc",
    "ipixc",
    "clientsecretmkauth",
    "clientidmkauth",
    "ipmkauth",
    "tokensgp",
    "ipsgp",
    "appsgp"
  ])("never exposes the secret setting %s", key => {
    expect(isPublicSettingKey(key)).toBe(false);
  });

  it("does not expose an unknown key", () => {
    expect(isPublicSettingKey("qualquerOutraChave")).toBe(false);
  });

  it("is case sensitive, so a variant cannot slip through", () => {
    expect(isPublicSettingKey("AllowRegister")).toBe(false);
  });

  it("does not treat an empty key as public", () => {
    expect(isPublicSettingKey("")).toBe(false);
  });
});
