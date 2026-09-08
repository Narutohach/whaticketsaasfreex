const mockCompanyFindByPk = jest.fn();
jest.mock("../../models/Company", () => ({
  findByPk: (...args: unknown[]) => mockCompanyFindByPk(...args)
}));

jest.mock("../../models/Plan", () => ({}));

const mockPromptSum = jest.fn();
const mockPromptIncrement = jest.fn().mockResolvedValue(undefined);
jest.mock("../../models/Prompt", () => ({
  sum: (...args: unknown[]) => mockPromptSum(...args),
  increment: (...args: unknown[]) => mockPromptIncrement(...args)
}));

const mockMessageFindAll = jest.fn().mockResolvedValue([]);
jest.mock("../../models/Message", () => ({
  findAll: (...args: unknown[]) => mockMessageFindAll(...args)
}));

const mockGenerateText = jest.fn().mockResolvedValue({
  text: "resposta gerada",
  totalTokens: 50,
  promptTokens: 30,
  completionTokens: 20
});

jest.mock("../../services/AI/AIProviderFactory", () => ({
  AIProviderFactory: {
    create: jest.fn().mockReturnValue({ generateText: mockGenerateText })
  }
}));

// eslint-disable-next-line import/first -- precisa vir depois dos jest.mock acima
import { ExecuteAIService } from "../../services/AI/ExecuteAIService";

const buildPrompt = (overrides = {}) =>
  ({
    id: 1,
    queueId: 9,
    provider: "openai",
    apiKey: "sk-test",
    model: "gpt-4o-mini",
    prompt: "regras da empresa",
    maxTokens: 200,
    maxMessages: 10,
    temperature: 0.7,
    totalTokens: 100,
    ...overrides
  } as any);

const buildTicket = () => ({ id: 1, companyId: 7 } as any);
const buildContact = () => ({ name: "Cliente Teste" } as any);

describe("ExecuteAIService — limite de tokens da empresa", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMessageFindAll.mockResolvedValue([]);
    mockGenerateText.mockResolvedValue({
      text: "resposta gerada",
      totalTokens: 50,
      promptTokens: 30,
      completionTokens: 20
    });
  });

  // Bug real: a checagem antiga comparava prompt.totalTokens (contador de UM
  // prompt) contra o limite do plano. Uma empresa com várias filas, cada uma
  // com seu prompt, multiplicava o teto efetivo por prompt criado.
  it("blocks the AI when the SUM across all company prompts reaches the plan cap", async () => {
    mockCompanyFindByPk.mockResolvedValueOnce({
      status: true,
      plan: { maxTokensMonthly: 1000 }
    });
    mockPromptSum.mockResolvedValueOnce(1200);

    const result = await ExecuteAIService({
      prompt: buildPrompt({ totalTokens: 100 }),
      ticket: buildTicket(),
      contact: buildContact(),
      incomingText: "oi"
    });

    expect(mockPromptSum).toHaveBeenCalledWith("totalTokens", {
      where: { companyId: 7 }
    });
    expect(mockGenerateText).not.toHaveBeenCalled();
    expect(result.action).toBe("transfer_queue");
    expect(result.replyText).toMatch(/Limite/);
  });

  it("allows the AI when combined company usage is still under the cap", async () => {
    mockCompanyFindByPk.mockResolvedValueOnce({
      status: true,
      plan: { maxTokensMonthly: 1000 }
    });
    mockPromptSum.mockResolvedValueOnce(300);

    const result = await ExecuteAIService({
      prompt: buildPrompt({ totalTokens: 100 }),
      ticket: buildTicket(),
      contact: buildContact(),
      incomingText: "oi"
    });

    expect(mockGenerateText).toHaveBeenCalled();
    expect(result.replyText).toBe("resposta gerada");
  });

  it("skips the check entirely when the plan has no token cap configured", async () => {
    mockCompanyFindByPk.mockResolvedValueOnce({ status: true, plan: {} });

    await ExecuteAIService({
      prompt: buildPrompt(),
      ticket: buildTicket(),
      contact: buildContact(),
      incomingText: "oi"
    });

    expect(mockPromptSum).not.toHaveBeenCalled();
    expect(mockGenerateText).toHaveBeenCalled();
  });
});
