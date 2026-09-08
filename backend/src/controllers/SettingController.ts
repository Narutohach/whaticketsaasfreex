import { Request, Response } from "express";
import authConfig from "../config/auth";
import * as Yup from "yup";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import { head } from "lodash";
import fs from "fs";
import path from "path";
import User from "../models/User";
import Company from "../models/Company";

import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";
import ShowSettingsService from "../services/SettingServices/ShowSettingsService";
import GetPublicSettingsCompanyId, {
  isPublicSettingKey
} from "../helpers/PublicSettings";
import { registerAudit } from "../helpers/RegisterAudit";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  //if (req.user.profile !== "admin") {
    //throw new AppError("ERR_NO_PERMISSION", 403);
  //}

  const settings = await ListSettingsService({ companyId });

  return res.status(200).json(settings);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { settingKey: key } = req.params;
  const { value } = req.body;
  const { companyId } = req.user;

  const setting = await UpdateSettingService({
    key,
    value,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-settings`, {
    action: "update",
    setting
  });

  // Apenas a chave: muitos valores de configuração são credenciais de
  // integração (tokens de gateway, chaves de API, etc.).
  await registerAudit(req, {
    action: "setting.update",
    entity: "setting",
    entityId: key,
    metadata: {
      key
    }
  });

  return res.status(200).json(setting);
};


export const show = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { settingKey } = req.params;

  const retornoData = await ShowSettingsService({ settingKey, companyId });

  return res.status(200).json(retornoData);
};

export const publicShow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { settingKey } = req.params;

  if (!isPublicSettingKey(settingKey)) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const companyId = await GetPublicSettingsCompanyId();

  const retornoData = await ShowSettingsService({ settingKey, companyId });

  return res.status(200).json(retornoData);
};


export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const userId = req.user.id;
  const requestUser = await User.findByPk(userId);

  if (!requestUser || !requestUser.super) {
    throw new AppError("você nao tem permissão para esta ação!", 403);
  }

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const files = req.files as Express.Multer.File[];
  const file = head(files);
  return res.send({ mensagem: "Arquivo Anexado" });
};


export const certUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const userId = req.user.id;
  const requestUser = await User.findByPk(userId);

  if (!requestUser || !requestUser.super) {
    throw new AppError("você nao tem permissão para esta ação!", 403);
  }

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const files = req.files as Express.Multer.File[];
  const file = head(files);
  return res.send({ mensagem: "Arquivo Anexado" });
};


export const docUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const userId = req.user.id;
  const requestUser = await User.findByPk(userId);

  if (!requestUser || !requestUser.super) {
    throw new AppError("você nao tem permissão para esta ação!", 403);
  }

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const files = req.files as Express.Multer.File[];
  const file = head(files);
  return res.send({ mensagem: "Arquivo Anexado" });
};
