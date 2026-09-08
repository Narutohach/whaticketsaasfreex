import AuditLog from "../../models/AuditLog";
import { logger } from "../../utils/logger";

export interface AuditLogData {
  companyId?: number | null;
  userId?: number | null;
  userEmail?: string | null;
  action: string;
  entity: string;
  entityId?: string | number | null;
  metadata?: Record<string, any> | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Chaves que nunca podem entrar na trilha. A auditoria existe para dizer quem
 * mexeu no quê — se ela também guardar credenciais, passa a ser o alvo mais
 * valioso do banco. A comparação é case-insensitive e por substring, então
 * `ApiKey`, `API_KEY` e `openaiApiKey` caem todas na mesma regra.
 */
export const SENSITIVE_METADATA_KEYS = [
  "password",
  "apikey",
  "voicekey",
  "token",
  "accesstoken",
  "session",
  "creds",
  "keys",
  "clientsecret",
  "client_secret"
];

export const REDACTED_VALUE = "[REDACTED]";

// Limite por valor de texto: evita que um prompt colado ou o corpo de uma
// mensagem inflem a tabela.
export const MAX_METADATA_STRING_LENGTH = 500;

// Profundidade máxima percorrida: protege contra estruturas cíclicas ou
// absurdamente aninhadas vindas do corpo da requisição.
const MAX_METADATA_DEPTH = 6;

// Separadores são descartados dos dois lados da comparação para que
// `API_KEY`, `api-key` e `apiKey` sejam tratados como a mesma chave.
const normalizeKey = (key: string): string =>
  String(key).toLowerCase().replace(/[-_\s]/g, "");

const isSensitiveKey = (key: string): boolean => {
  const normalized = normalizeKey(key);

  return SENSITIVE_METADATA_KEYS.some(sensitive =>
    normalized.includes(normalizeKey(sensitive))
  );
};

const truncate = (value: string): string =>
  value.length > MAX_METADATA_STRING_LENGTH
    ? `${value.slice(0, MAX_METADATA_STRING_LENGTH)}...`
    : value;

const sanitizeValue = (value: any, depth: number): any => {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (typeof value === "string") {
    return truncate(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (depth >= MAX_METADATA_DEPTH) {
    return REDACTED_VALUE;
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, depth + 1));
  }

  if (typeof value === "object") {
    const result: Record<string, any> = {};

    Object.keys(value).forEach(key => {
      if (isSensitiveKey(key)) {
        result[key] = REDACTED_VALUE;
        return;
      }

      result[key] = sanitizeValue((value as Record<string, any>)[key], depth + 1);
    });

    return result;
  }

  // Funções, símbolos e afins não pertencem à trilha.
  return null;
};

/**
 * Remove recursivamente qualquer chave sensível e trunca textos longos.
 * Exportado separadamente para poder ser testado sem tocar no banco.
 */
export const sanitizeMetadata = (
  metadata?: Record<string, any> | null
): Record<string, any> | null => {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  if (Array.isArray(metadata)) {
    return { items: sanitizeValue(metadata, 0) };
  }

  return sanitizeValue(metadata, 0);
};

/**
 * Grava um registro na trilha de auditoria. Nunca lança: uma falha aqui não
 * pode transformar uma ação administrativa bem-sucedida em erro 500.
 */
const CreateAuditLogService = async (
  data: AuditLogData
): Promise<AuditLog | null> => {
  try {
    const auditLog = await AuditLog.create({
      companyId: data.companyId ?? null,
      userId: data.userId ?? null,
      userEmail: data.userEmail ?? null,
      action: data.action,
      entity: data.entity,
      entityId:
        data.entityId === null || data.entityId === undefined
          ? null
          : String(data.entityId),
      metadata: sanitizeMetadata(data.metadata),
      ip: data.ip ? truncate(data.ip) : null,
      userAgent: data.userAgent ? truncate(data.userAgent) : null
    });

    return auditLog;
  } catch (err) {
    logger.error(
      `Falha ao gravar auditoria (${data?.action}): ${err?.message || err}`
    );

    return null;
  }
};

export default CreateAuditLogService;
