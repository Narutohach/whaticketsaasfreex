import Company from "../models/Company";
import Setting from "../models/Setting";

/**
 * Chaves de configuração que podem ser lidas sem autenticação, porque as telas
 * de login e cadastro precisam delas antes de existir um token.
 *
 * Qualquer chave fora desta lista exige autenticação e é sempre resolvida pelo
 * companyId do token: a tabela `Settings` guarda segredos por empresa (asaas,
 * tokenixc, clientsecretmkauth, tokensgp, ipsgp...) que nunca podem ser
 * expostos publicamente nem lidos por outra empresa.
 */
const PUBLIC_SETTING_KEYS = ["allowregister", "viewregister", "trial"];

export const isPublicSettingKey = (settingKey: string): boolean =>
  PUBLIC_SETTING_KEYS.includes(settingKey);

let cachedCompanyId: number | null = null;

/**
 * Empresa que responde pelas configurações globais do produto (as que a tela de
 * login/cadastro lê). Por padrão é a empresa mais antiga — a master criada no
 * seed — e pode ser fixada por env em instalações que removeram a empresa 1.
 */
const GetPublicSettingsCompanyId = async (): Promise<number> => {
  if (cachedCompanyId) {
    return cachedCompanyId;
  }

  const fromEnv = Number(process.env.MASTER_COMPANY_ID);

  if (fromEnv) {
    cachedCompanyId = fromEnv;
    return cachedCompanyId;
  }

  const company = await Company.findOne({ order: [["id", "ASC"]] });

  cachedCompanyId = company?.id || 1;

  return cachedCompanyId;
};

/**
 * Lê uma configuração global do produto tolerando ausência, para uso em fluxos
 * públicos (cadastro) que não podem quebrar por falta de seed.
 */
export const getGlobalSettingValue = async (
  key: string,
  fallback: string
): Promise<string> => {
  const companyId = await GetPublicSettingsCompanyId();

  const setting = await Setting.findOne({ where: { key, companyId } });

  return setting?.value || fallback;
};

export default GetPublicSettingsCompanyId;
