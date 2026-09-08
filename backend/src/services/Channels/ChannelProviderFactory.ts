import { ChannelProvider } from "./ChannelProvider";
import { BaileysChannelProvider } from "./BaileysChannelProvider";
import { MetaCloudApiChannelProvider } from "./MetaCloudApiChannelProvider";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import { decrypt } from "../../helpers/crypto";

export class ChannelProviderFactory {
  static getProvider(whatsapp: Whatsapp): ChannelProvider {
    const providerType = whatsapp.provider || "baileys";

    if (providerType === "meta_cloud" || providerType === "meta") {
      const accessToken = whatsapp.token ? decrypt(whatsapp.token) : "";
      if (!whatsapp.phoneNumberId || !accessToken) {
        throw new AppError("ERR_META_CLOUD_CREDENTIALS_MISSING");
      }

      return new MetaCloudApiChannelProvider({
        phoneNumberId: whatsapp.phoneNumberId,
        wabaId: whatsapp.wabaId,
        accessToken,
        apiVersion: (whatsapp as any).apiVersion || "v20.0"
      });
    }

    // Default to Baileys provider
    return new BaileysChannelProvider(whatsapp.id);
  }
}
