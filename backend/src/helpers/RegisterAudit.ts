import { Request } from "express";

import User from "../models/User";
import CreateAuditLogService from "../services/AuditServices/CreateAuditLogService";
import { logger } from "../utils/logger";

export interface RegisterAuditOptions {
  action: string;
  entity?: string;
  entityId?: string | number | null;
  metadata?: Record<string, any> | null;
  // Só para ações que acontecem fora do tenant do autor (ex.: o super admin
  // criando uma empresa nova). Nunca é lido do corpo da requisição.
  companyId?: number | null;
}

/**
 * Registra uma ação administrativa na trilha de auditoria.
 *
 * A identidade do autor vem exclusivamente de `req.user` (preenchido pelo
 * middleware isAuth a partir do JWT) — nunca do corpo ou da query, que são
 * controlados pelo cliente.
 *
 * Esta função nunca lança: a auditoria é complementar à ação auditada e não
 * pode fazer uma operação bem-sucedida virar erro.
 */
const registerAudit = async (
  req: Request,
  options: RegisterAuditOptions
): Promise<void> => {
  try {
    const actor = req?.user;
    const userId = actor?.id ? Number(actor.id) : null;

    let userEmail: string | null = null;

    if (userId) {
      const user = await User.findByPk(userId, {
        attributes: ["id", "email"]
      });

      userEmail = user?.email ?? null;
    }

    const companyId =
      options.companyId !== undefined
        ? options.companyId
        : actor?.companyId ?? null;

    // "company.update" -> entidade "company" quando não informada.
    const entity = options.entity || String(options.action).split(".")[0];

    const userAgent = req?.headers?.["user-agent"];

    await CreateAuditLogService({
      companyId: companyId ? Number(companyId) : null,
      userId,
      userEmail,
      action: options.action,
      entity,
      entityId: options.entityId ?? null,
      metadata: options.metadata ?? null,
      ip: req?.ip ?? null,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent ?? null
    });
  } catch (err) {
    logger.error(
      `Falha ao registrar auditoria (${options?.action}): ${
        err?.message || err
      }`
    );
  }
};

export default registerAudit;
export { registerAudit };
