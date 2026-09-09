const mockFindByPk = jest.fn();
jest.mock("../../models/User", () => ({
  __esModule: true,
  default: { findByPk: (...args: unknown[]) => mockFindByPk(...args) }
}));

// eslint-disable-next-line import/first -- precisa vir depois do jest.mock acima
import isAdmin from "../../middleware/isAdmin";
// eslint-disable-next-line import/first -- AppError não estende Error, então
// .rejects.toThrow() não reconhece a rejeição; comparamos o shape direto.
import AppError from "../../errors/AppError";

/**
 * Regressão real: isAdmin confiava só nas claims `profile`/`super` do JWT.
 * Como o access token vive até 15 minutos (config/auth.ts), um admin
 * rebaixado a "user" em runtime continuava passando por rotas
 * administrativas (filas, WhatsApp, prompts, integrações, arquivos) até o
 * token expirar. Agora relê do banco a cada requisição, igual isSuper.ts.
 */
describe("isAdmin", () => {
  const buildReq = (tokenProfile: string, tokenSuper = false) =>
    ({ user: { id: 1, profile: tokenProfile, super: tokenSuper } }) as any;

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects a user demoted in the database, even if the token still claims admin", async () => {
    mockFindByPk.mockResolvedValueOnce({ profile: "user", super: false });

    await expect(
      isAdmin(buildReq("admin"), {} as any, next)
    ).rejects.toMatchObject(new AppError("ERR_NO_PERMISSION", 403));
    expect(next).not.toHaveBeenCalled();
  });

  it("allows a user whose database record is admin", async () => {
    mockFindByPk.mockResolvedValueOnce({ profile: "admin", super: false });

    await isAdmin(buildReq("admin"), {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("allows a super admin regardless of profile", async () => {
    mockFindByPk.mockResolvedValueOnce({ profile: "user", super: true });

    await isAdmin(buildReq("user", true), {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("rejects when the user no longer exists", async () => {
    mockFindByPk.mockResolvedValueOnce(null);

    await expect(
      isAdmin(buildReq("admin"), {} as any, next)
    ).rejects.toMatchObject(new AppError("ERR_NO_PERMISSION", 403));
    expect(next).not.toHaveBeenCalled();
  });
});
