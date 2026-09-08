import { Request, Response } from "express";

import AppError from "../errors/AppError";
import User from "../models/User";
import ListAuditLogsService from "../services/AuditServices/ListAuditLogsService";

type IndexQuery = {
  pageNumber?: string;
  action?: string;
  companyId?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, action, companyId: queryCompanyId } =
    req.query as IndexQuery;
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // O escopo padrão é sempre a empresa do token. Ler a trilha de outra
  // empresa é exclusivo do super admin — e o flag é confirmado no banco,
  // não aceito apenas pelo que veio no JWT.
  let targetCompanyId = companyId;

  if (queryCompanyId && +queryCompanyId !== companyId) {
    const requestUser = await User.findByPk(req.user.id);

    if (!requestUser || !requestUser.super) {
      throw new AppError("ERR_NO_PERMISSION", 403);
    }

    targetCompanyId = +queryCompanyId;
  }

  const { logs, count, hasMore } = await ListAuditLogsService({
    companyId: targetCompanyId,
    action,
    pageNumber
  });

  return res.status(200).json({ logs, count, hasMore });
};
