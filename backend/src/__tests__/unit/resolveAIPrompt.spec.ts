const mockShowWhatsAppService = jest.fn();
jest.mock("../../services/WhatsappService/ShowWhatsAppService", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockShowWhatsAppService(...args)
}));

const mockPromptFindOne = jest.fn();
jest.mock("../../models/Prompt", () => ({
  findOne: (...args: unknown[]) => mockPromptFindOne(...args)
}));

// eslint-disable-next-line import/first -- precisa vir depois dos jest.mock acima
import ResolveAIPrompt from "../../helpers/ResolveAIPrompt";

const queuePrompt = { id: 1, name: "Prompt da fila" };
const connectionPrompt = { id: 2, name: "Prompt da conexão" };
const companyDefaultPrompt = { id: 3, name: "Prompt padrão da empresa" };

const buildTicket = (queue?: any) => ({ companyId: 7, queue } as any);

describe("ResolveAIPrompt", () => {
  beforeEach(() => {
    // resetAllMocks (não clearAllMocks): alguns testes fazem a cascata
    // retornar cedo sem consumir o mockResolvedValueOnce enfileirado, e
    // clearAllMocks não esvazia essa fila — o valor vazava pro teste seguinte.
    jest.resetAllMocks();
  });

  // Bug real: handleOpenAi olhava a conexão primeiro e só caía pro prompt da
  // fila se a conexão não tivesse nenhum — uma configuração de IA por fila
  // nunca era usada se a conexão também tivesse uma configurada.
  it("prefers the queue prompt over the connection prompt", async () => {
    mockShowWhatsAppService.mockResolvedValueOnce({ prompt: connectionPrompt });

    const result = await ResolveAIPrompt(
      1,
      buildTicket({ prompt: queuePrompt })
    );

    expect(result).toBe(queuePrompt);
    expect(mockPromptFindOne).not.toHaveBeenCalled();
  });

  it("falls back to the connection prompt when the queue has none", async () => {
    mockShowWhatsAppService.mockResolvedValueOnce({ prompt: connectionPrompt });

    const result = await ResolveAIPrompt(1, buildTicket());

    expect(result).toBe(connectionPrompt);
    expect(mockPromptFindOne).not.toHaveBeenCalled();
  });

  it("falls back to the company default prompt when neither queue nor connection has one", async () => {
    mockShowWhatsAppService.mockResolvedValueOnce({ prompt: null });
    mockPromptFindOne.mockResolvedValueOnce(companyDefaultPrompt);

    const result = await ResolveAIPrompt(1, buildTicket());

    expect(mockPromptFindOne).toHaveBeenCalledWith({
      where: { companyId: 7, isDefault: true }
    });
    expect(result).toBe(companyDefaultPrompt);
  });

  it("returns null when no level of the cascade has a prompt configured", async () => {
    mockShowWhatsAppService.mockResolvedValueOnce({ prompt: null });
    mockPromptFindOne.mockResolvedValueOnce(null);

    const result = await ResolveAIPrompt(1, buildTicket());

    expect(result).toBeNull();
  });
});
