const mockUpsert = jest.fn().mockResolvedValue(undefined);
const mockDestroy = jest.fn().mockResolvedValue(undefined);
const mockFindByPk = jest.fn();
const mockFindAll = jest.fn();

jest.mock("../../models/InboundMessageBacklog", () => ({
  __esModule: true,
  default: {
    upsert: (...args: unknown[]) => mockUpsert(...args),
    destroy: (...args: unknown[]) => mockDestroy(...args),
    findByPk: (...args: unknown[]) => mockFindByPk(...args),
    findAll: (...args: unknown[]) => mockFindAll(...args)
  }
}));

// eslint-disable-next-line import/first -- precisa vir depois do jest.mock acima
import {
  isSafelyReplayableType,
  recordInboundMessageReceived,
  markInboundMessageProcessed,
  markInboundMessageFailed,
  findStalledInboundMessages
} from "../../helpers/InboundMessageDurability";

/**
 * Regressão do bug real: a fila de mensagens recebidas era só um array em
 * memória, drenado por um setInterval — uma queda do processo entre o
 * recebimento e o processamento perdia a mensagem em silêncio, porque o
 * WhatsApp já considera entregue assim que o Baileys recebe.
 */
describe("InboundMessageDurability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isSafelyReplayableType", () => {
    it("accepts plain text types", () => {
      expect(isSafelyReplayableType("conversation")).toBe(true);
      expect(isSafelyReplayableType("extendedTextMessage")).toBe(true);
    });

    // Mídia carrega mediaKey/fileEncSha256 como bytes binários, que não
    // sobrevivem a um JSON.stringify/parse — replay automático quebraria o
    // download.
    it("rejects media types", () => {
      expect(isSafelyReplayableType("imageMessage")).toBe(false);
      expect(isSafelyReplayableType("audioMessage")).toBe(false);
      expect(isSafelyReplayableType("videoMessage")).toBe(false);
    });

    it("rejects undefined", () => {
      expect(isSafelyReplayableType(undefined)).toBe(false);
    });
  });

  describe("recordInboundMessageReceived", () => {
    it("stores the raw envelope for a text message", async () => {
      const message = {
        key: { id: "wamid.1" },
        message: { conversation: "oi" }
      } as any;

      await recordInboundMessageReceived(message, 1, 7, "conversation");

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "wamid.1",
          whatsappId: 1,
          companyId: 7,
          messageType: "conversation",
          status: "pending",
          rawJson: JSON.stringify(message)
        })
      );
    });

    it("does not store the raw envelope for a media message", async () => {
      const message = { key: { id: "wamid.2" } } as any;

      await recordInboundMessageReceived(message, 1, 7, "imageMessage");

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ rawJson: null })
      );
    });

    it("does nothing when the message has no id", async () => {
      await recordInboundMessageReceived({ key: {} } as any, 1, 7, "conversation");

      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe("markInboundMessageProcessed", () => {
    // A linha some no sucesso: mantê-la duplicaria o conteúdo de toda
    // mensagem de texto recebida indefinidamente.
    it("deletes the backlog row", async () => {
      await markInboundMessageProcessed("wamid.1");

      expect(mockDestroy).toHaveBeenCalledWith({ where: { id: "wamid.1" } });
    });
  });

  describe("markInboundMessageFailed", () => {
    it("increments attempts and records the error message", async () => {
      const update = jest.fn().mockResolvedValue(undefined);
      mockFindByPk.mockResolvedValueOnce({ attempts: 2, update });

      await markInboundMessageFailed("wamid.1", new Error("boom"));

      expect(update).toHaveBeenCalledWith({
        status: "failed",
        attempts: 3,
        lastError: "boom"
      });
    });

    it("never throws, even if the backlog row cannot be updated", async () => {
      mockFindByPk.mockRejectedValueOnce(new Error("db down"));

      await expect(
        markInboundMessageFailed("wamid.1", new Error("boom"))
      ).resolves.toBeUndefined();
    });
  });

  describe("findStalledInboundMessages", () => {
    it("returns only the safely replayable (text) entries for reprocessing", async () => {
      mockFindAll.mockResolvedValueOnce([
        { id: "text-1", messageType: "conversation" },
        { id: "media-1", messageType: "imageMessage" }
      ]);

      const result = await findStalledInboundMessages();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("text-1");
    });
  });
});
