import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

interface IOnWhatsapp {
  jid: string;
  exists: boolean;
}

const checker = async (number: string, wbot: any) => {
  const [validNumber] = await wbot.onWhatsApp(`${number}@s.whatsapp.net`);

  // Nao logar o jid/telefone do contato (LGPD); apenas o resultado da checagem
  logger.debug(`CheckNumber: exists=${!!validNumber?.exists}`);

  return validNumber;
};

const CheckContactNumber = async (
  number: string,
  companyId: number
): Promise<IOnWhatsapp> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);

  const wbot = getWbot(defaultWhatsapp.id);
  const isNumberExit = await checker(number, wbot);

  if (!isNumberExit.exists) {
    throw new Error("ERR_CHECK_NUMBER");
  }
  return isNumberExit;
};

export default CheckContactNumber;
