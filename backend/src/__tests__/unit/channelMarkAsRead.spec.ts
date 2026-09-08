const mockChatModify = jest.fn().mockResolvedValue(undefined);

jest.mock("../../libs/wbot", () => ({
  getWbot: jest.fn().mockReturnValue({
    chatModify: mockChatModify
  })
}));

jest.mock("../../models/Ticket", () => ({}));

const mockFindByPk = jest.fn();
jest.mock("../../models/Message", () => ({
  findByPk: (...args: unknown[]) => mockFindByPk(...args)
}));

// eslint-disable-next-line import/first -- precisa vir depois dos jest.mock acima
import { BaileysChannelProvider } from "../../services/Channels/BaileysChannelProvider";

// Antes desta correção, markAsRead() para conexões Baileys era um no-op: não
// existia lógica nenhuma, só um try/catch vazio em volta de getWbot().
describe("BaileysChannelProvider.markAsRead", () => {
  const provider = new BaileysChannelProvider(1);

  it("sends a read receipt for the last inbound message", async () => {
    mockFindByPk.mockResolvedValueOnce({
      dataJson: JSON.stringify({ key: { id: "wamid.1", fromMe: false } }),
      ticket: { isGroup: false, contact: { number: "5511999999999" } }
    });

    await provider.markAsRead("wamid.1");

    expect(mockChatModify).toHaveBeenCalledWith(
      { markRead: true, lastMessages: [{ key: { id: "wamid.1", fromMe: false } }] },
      "5511999999999@s.whatsapp.net"
    );
  });

  it("does nothing when the message no longer exists locally", async () => {
    mockFindByPk.mockResolvedValueOnce(null);

    await provider.markAsRead("unknown");

    expect(mockChatModify).not.toHaveBeenCalled();
  });

  it("does nothing for a message the agent sent (fromMe)", async () => {
    mockFindByPk.mockResolvedValueOnce({
      dataJson: JSON.stringify({ key: { id: "wamid.2", fromMe: true } }),
      ticket: { isGroup: false, contact: { number: "5511999999999" } }
    });

    await provider.markAsRead("wamid.2");

    expect(mockChatModify).not.toHaveBeenCalled();
  });

  it("uses the group jid suffix for group tickets", async () => {
    mockFindByPk.mockResolvedValueOnce({
      dataJson: JSON.stringify({ key: { id: "wamid.3", fromMe: false } }),
      ticket: { isGroup: true, contact: { number: "120363000000000" } }
    });

    await provider.markAsRead("wamid.3");

    expect(mockChatModify).toHaveBeenCalledWith(
      expect.anything(),
      "120363000000000@g.us"
    );
  });
});
