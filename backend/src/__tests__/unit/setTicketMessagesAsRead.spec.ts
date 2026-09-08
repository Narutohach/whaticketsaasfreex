const mockEmit = jest.fn();
const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });

jest.mock("../../libs/socket", () => ({
  getIO: jest.fn().mockReturnValue({ to: mockTo })
}));

const mockMessageFindOne = jest.fn();
const mockMessageUpdate = jest.fn().mockResolvedValue(undefined);

jest.mock("../../models/Message", () => ({
  findOne: (...args: unknown[]) => mockMessageFindOne(...args),
  update: (...args: unknown[]) => mockMessageUpdate(...args)
}));

jest.mock("../../models/Whatsapp", () => ({
  findByPk: jest.fn()
}));

const mockMarkAsRead = jest.fn();

jest.mock("../../services/Channels/ChannelProviderFactory", () => ({
  ChannelProviderFactory: {
    getProvider: jest.fn().mockReturnValue({ markAsRead: mockMarkAsRead })
  }
}));

// eslint-disable-next-line import/first -- precisa vir depois dos jest.mock acima
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

const buildTicket = () =>
  ({
    id: 42,
    companyId: 7,
    whatsappId: 1,
    whatsapp: { id: 1, provider: "meta_cloud" },
    update: jest.fn().mockResolvedValue(undefined)
  }) as any;

describe("SetTicketMessagesAsRead", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Bug real: GetTicketWbot lança ERR_WAPP_NOT_INITIALIZED para conexões Meta
  // Cloud (nunca há sessão Baileys registrada) e o catch abortava a função
  // ANTES do Message.update, então o contador de não lidas nunca zerava.
  it("still marks messages as read in the DB when the channel read-receipt fails", async () => {
    mockMessageFindOne.mockResolvedValueOnce({ id: "wamid.1" });
    mockMarkAsRead.mockRejectedValueOnce(new Error("ERR_WAPP_NOT_INITIALIZED"));

    const ticket = buildTicket();

    await SetTicketMessagesAsRead(ticket);

    expect(ticket.update).toHaveBeenCalledWith({ unreadMessages: 0 });
    expect(mockMessageUpdate).toHaveBeenCalledWith(
      { read: true },
      { where: { ticketId: 42, read: false } }
    );
  });

  it("still marks messages as read when there is no unread message", async () => {
    mockMessageFindOne.mockResolvedValueOnce(null);

    const ticket = buildTicket();

    await SetTicketMessagesAsRead(ticket);

    expect(mockMarkAsRead).not.toHaveBeenCalled();
    expect(mockMessageUpdate).toHaveBeenCalledWith(
      { read: true },
      { where: { ticketId: 42, read: false } }
    );
  });

  it("emits the unread-count update over the company socket room", async () => {
    mockMessageFindOne.mockResolvedValueOnce(null);

    const ticket = buildTicket();

    await SetTicketMessagesAsRead(ticket);

    expect(mockTo).toHaveBeenCalledWith("company-7-mainchannel");
    expect(mockEmit).toHaveBeenCalledWith("company-7-ticket", {
      action: "updateUnread",
      ticketId: 42
    });
  });
});
