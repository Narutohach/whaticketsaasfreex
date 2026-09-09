import { v4 as uuid } from "uuid";
// Só importar os models não inicializa o Sequelize — precisa deste import
// para registrar os models na instância (ver database/index.ts).
import database from "../../database";
import Company from "../../models/Company";
import User from "../../models/User";
import ResetPassword from "../../services/ResetPasswordService/ResetPassword";

/**
 * Regressão real: o token de redefinição de senha (resetPassword) nunca teve
 * prazo de validade — só era invalidado quando usado. Um link de "esqueci
 * minha senha" gerado uma vez ficava válido para sempre até alguém usá-lo ou
 * pedir um novo.
 */
describe("ResetPassword — expiração do token", () => {
  afterAll(async () => {
    await database.close();
  });

  const createUserWithToken = async (expiresInHours: number | null) => {
    const company = await Company.create({
      name: `Empresa-reset-${Date.now()}-${Math.random()}`,
      status: true
    } as Company);

    const email = `reset-${Date.now()}-${Math.random()}@example.com`;
    const token = uuid();

    const user = await User.create({
      name: "Usuario reset",
      email,
      password: "senha-antiga-123",
      profile: "admin",
      companyId: company.id
    } as unknown as User);

    if (expiresInHours === null) {
      await database.query(
        `UPDATE "Users" SET "resetPassword" = :token, "resetPasswordExpires" = NULL WHERE id = :id`,
        { replacements: { token, id: user.id } }
      );
    } else {
      await database.query(
        `UPDATE "Users" SET "resetPassword" = :token, "resetPasswordExpires" = NOW() + (:hours || ' hours')::interval WHERE id = :id`,
        { replacements: { token, id: user.id, hours: expiresInHours } }
      );
    }

    return { email, token };
  };

  it("accepts a token that has not expired yet", async () => {
    const { email, token } = await createUserWithToken(1);

    const result = await ResetPassword(email, token, "senha-nova-123");

    expect(result).toBe(true);
  });

  it("rejects a token whose expiry has already passed", async () => {
    const { email, token } = await createUserWithToken(-1);

    const result = await ResetPassword(email, token, "senha-nova-123");

    expect(result).toBe(false);
  });

  it("rejects a token that predates this fix and has no expiry recorded", async () => {
    const { email, token } = await createUserWithToken(null);

    const result = await ResetPassword(email, token, "senha-nova-123");

    expect(result).toBe(false);
  });

  it("cannot be reused after a successful reset", async () => {
    const { email, token } = await createUserWithToken(1);

    const first = await ResetPassword(email, token, "senha-nova-123");
    const second = await ResetPassword(email, token, "outra-senha-456");

    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
