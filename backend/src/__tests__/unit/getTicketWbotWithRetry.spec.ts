const mockGetTicketWbot = jest.fn();
jest.mock("../../helpers/GetTicketWbot", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockGetTicketWbot(...args)
}));

// eslint-disable-next-line import/first -- precisa vir depois do jest.mock acima
import GetTicketWbotWithRetry from "../../helpers/GetTicketWbotWithRetry";

const fakeTicket = { whatsappId: 1 } as any;

/**
 * Antes desta correção, uma queda breve de conexão fazia toda mensagem de
 * agente falhar imediatamente e nunca existir — o atendente via erro e tinha
 * que reenviar manualmente. Passa a tentar de novo por alguns segundos.
 */
describe("GetTicketWbotWithRetry", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns immediately on the first success, without waiting", async () => {
    const wbot = { id: 1 };
    mockGetTicketWbot.mockResolvedValueOnce(wbot);

    const result = await GetTicketWbotWithRetry(fakeTicket);

    expect(result).toBe(wbot);
    expect(mockGetTicketWbot).toHaveBeenCalledTimes(1);
  });

  it("retries after a transient failure and succeeds", async () => {
    const wbot = { id: 1 };
    mockGetTicketWbot
      .mockRejectedValueOnce(new Error("ERR_WAPP_NOT_INITIALIZED"))
      .mockResolvedValueOnce(wbot);

    // maxAttempts alto o bastante, delay real é curto o suficiente pro teste
    // não precisar de fake timers (a 1a tentativa de calculateReconnectDelay
    // é ~2s — aceitável para um teste único, evita a fragilidade de mockar
    // setTimeout).
    const result = await GetTicketWbotWithRetry(fakeTicket);

    expect(result).toBe(wbot);
    expect(mockGetTicketWbot).toHaveBeenCalledTimes(2);
  }, 10000);

  it("gives up and throws the last error after exhausting attempts", async () => {
    const error = new Error("ERR_WAPP_NOT_INITIALIZED");
    mockGetTicketWbot.mockRejectedValue(error);

    await expect(GetTicketWbotWithRetry(fakeTicket, 2)).rejects.toBe(error);
    expect(mockGetTicketWbot).toHaveBeenCalledTimes(2);
  }, 10000);

  it("does not wait after the very last attempt", async () => {
    mockGetTicketWbot.mockRejectedValue(new Error("ERR_WAPP_NOT_INITIALIZED"));

    const start = Date.now();
    await expect(GetTicketWbotWithRetry(fakeTicket, 1)).rejects.toThrow();
    const elapsed = Date.now() - start;

    // Uma única tentativa não deveria esperar backoff nenhum.
    expect(elapsed).toBeLessThan(500);
  });
});
