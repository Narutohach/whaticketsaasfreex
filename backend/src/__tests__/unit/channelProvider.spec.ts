jest.mock("../../libs/wbot", () => ({
  getWbot: jest.fn().mockReturnValue({
    sendMessage: jest.fn().mockResolvedValue({ key: { id: "mock_msg_id" } }),
    user: { id: "5511999999999@s.whatsapp.net" }
  })
}));

import { ChannelProviderFactory } from "../../services/Channels/ChannelProviderFactory";
import { BaileysChannelProvider } from "../../services/Channels/BaileysChannelProvider";
import { MetaCloudApiChannelProvider } from "../../services/Channels/MetaCloudApiChannelProvider";
import Whatsapp from "../../models/Whatsapp";
import { encrypt } from "../../helpers/crypto";

describe("ChannelProviderFactory", () => {
  it("should instantiate BaileysChannelProvider for standard connections", () => {
    const mockWhatsapp = {
      id: 1,
      provider: "baileys",
      name: "Conexão Baileys"
    } as unknown as Whatsapp;

    const provider = ChannelProviderFactory.getProvider(mockWhatsapp);
    expect(provider).toBeInstanceOf(BaileysChannelProvider);
  });

  it("should instantiate MetaCloudApiChannelProvider for meta_cloud connections", () => {
    const mockWhatsapp = {
      id: 2,
      provider: "meta_cloud",
      phoneNumberId: "1234567890",
      wabaId: "0987654321",
      token: encrypt("EAAG...meta-token"),
      name: "Conexão Meta Oficial"
    } as unknown as Whatsapp;

    const provider = ChannelProviderFactory.getProvider(mockWhatsapp);
    expect(provider).toBeInstanceOf(MetaCloudApiChannelProvider);
  });
});
