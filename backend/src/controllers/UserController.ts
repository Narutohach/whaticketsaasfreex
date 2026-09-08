import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CheckSettingsHelper from "../helpers/CheckSettings";
import { registerAudit } from "../helpers/RegisterAudit";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import SimpleListService from "../services/UserServices/SimpleListService";
import User from "../models/User";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type ListQueryParams = {
  companyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    companyId,
    profile
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    email,
    password,
    name,
    profile,
    companyId: bodyCompanyId,
    queueIds,
    whatsappId,
	allTicket
  } = req.body;
  let userCompanyId: number | null = null;

  let requestUser: User = null;

  if (req.user !== undefined) {
    const { companyId: cId } = req.user;
    userCompanyId = cId;
    requestUser = await User.findByPk(req.user.id);
  }

  const newUserCompanyId = bodyCompanyId || userCompanyId; 

  if (req.url === "/signup") {
    if (!newUserCompanyId) {
      throw new AppError("ERR_NO_COMPANY_ID", 400);
    }
    if (
      (await CheckSettingsHelper("userCreation", newUserCompanyId)) ===
      "disabled"
    ) {
      throw new AppError("ERR_USER_CREATION_DISABLED", 403);
    }
  } else if (req.user?.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  } else if (newUserCompanyId !== req.user?.companyId && !requestUser?.super) {
    throw new AppError("ERR_NO_SUPER", 403);
  }

  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    companyId: newUserCompanyId,
    queueIds,
    whatsappId,
	allTicket
  });

  const io = getIO();
  io.to(`company-${userCompanyId}-mainchannel`).emit(`company-${userCompanyId}-user`, {
    action: "create",
    user
  });

  await registerAudit(req, {
    action: "user.create",
    entity: "user",
    entityId: user.id,
    companyId: newUserCompanyId,
    // A senha nunca entra na trilha.
    metadata: {
      email,
      name,
      profile,
      targetCompanyId: newUserCompanyId
    }
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  const user = await ShowUserService(userId, companyId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { id: requestUserId, companyId } = req.user;
  const { userId } = req.params;
  const userData = req.body;

  const user = await UpdateUserService({
    userData,
    userId,
    companyId,
    requestUserId: +requestUserId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-user`, {
    action: "update",
    user
  });

  await registerAudit(req, {
    action: "user.update",
    entity: "user",
    entityId: userId,
    metadata: {
      targetUserId: userId,
      // `password` é removido pelo sanitizador.
      changedFields: Object.keys(userData || {})
    }
  });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteUserService(userId, companyId);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-user`, {
    action: "delete",
    userId
  });

  await registerAudit(req, {
    action: "user.delete",
    entity: "user",
    entityId: userId,
    metadata: {
      targetUserId: userId
    }
  });

  return res.status(200).json({ message: "User deleted" });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.query;
  const { companyId: userCompanyId, super: isSuper } = req.user;

  // Listar usuários de outra empresa é exclusivo do super admin: sem esta
  // checagem qualquer usuário autenticado enumera os usuários de todos os
  // tenants passando ?companyId=N.
  if (companyId && +companyId !== userCompanyId && !isSuper) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const users = await SimpleListService({
    companyId: companyId ? +companyId : userCompanyId
  });

  return res.status(200).json(users);
};
