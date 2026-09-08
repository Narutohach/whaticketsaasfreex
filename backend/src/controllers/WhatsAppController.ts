import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { removeWbot, restartWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import AppError from "../errors/AppError";
import { registerAudit } from "../helpers/RegisterAudit";

interface WhatsappData {
  name: string;
  queueIds: number[];
  companyId: number;
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  ratingMessage?: string;
  status?: string;
  isDefault?: boolean;
  token?: string;
  provider?: string;
  phoneNumberId?: string;
  wabaId?: string;
  apiVersion?: string;
  transferQueueId?: number;
  timeToTransfer?: number;  
  promptId?: number;
  maxUseBotQueues?: number;
  timeUseBotQueues?: number;
  expiresTicket?: number;
  expiresInactiveMessage?: string;
}

interface QueryParams {
  session?: number | string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListWhatsAppsService({ companyId, session });

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    ratingMessage,
    outOfHoursMessage,
    queueIds,
    token,
    provider,
    phoneNumberId,
    wabaId,
    apiVersion,
    transferQueueId,
    timeToTransfer,
    promptId,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    expiresInactiveMessage
  }: WhatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    ratingMessage,
    outOfHoursMessage,
    queueIds,
    companyId,
    token,
    provider: provider || "baileys",
    phoneNumberId,
    wabaId,
    apiVersion,
    transferQueueId,
    timeToTransfer,	
    promptId,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    expiresInactiveMessage
  });

  if (whatsapp.provider !== "meta_cloud") {
    StartWhatsAppSession(whatsapp, companyId);
  }

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  // Nome e provedor apenas: `token` e a sessão nunca entram na trilha.
  await registerAudit(req, {
    action: "connection.create",
    entity: "whatsapp",
    entityId: whatsapp.id,
    metadata: {
      name: whatsapp.name,
      provider: whatsapp.provider,
      isDefault: whatsapp.isDefault
    }
  });

  return res.status(200).json(whatsapp);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { session } = req.query;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId, session);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  // Só os nomes dos campos alterados; o corpo pode trazer token e sessão.
  await registerAudit(req, {
    action: "connection.update",
    entity: "whatsapp",
    entityId: whatsappId,
    metadata: {
      name: whatsapp.name,
      provider: whatsapp.provider,
      changedFields: Object.keys(whatsappData || {})
    }
  });

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  await DeleteWhatsAppService(whatsappId);
  removeWbot(+whatsappId);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-whatsapp`, {
    action: "delete",
    whatsappId: +whatsappId
  });

  await registerAudit(req, {
    action: "connection.delete",
    entity: "whatsapp",
    entityId: whatsappId,
    metadata: {
      name: whatsapp?.name,
      provider: whatsapp?.provider
    }
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};


import { ChannelProviderFactory } from "../services/Channels/ChannelProviderFactory";
import { MetaCloudApiChannelProvider } from "../services/Channels/MetaCloudApiChannelProvider";

export const restart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await restartWbot(companyId);

  return res.status(200).json({ message: "Whatsapp restart." });
};

export const listTemplates = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  if (whatsapp.provider !== "meta_cloud" && whatsapp.provider !== "meta") {
    throw new AppError("Esta conexão não é do tipo Meta Cloud API", 400);
  }

  const channel = ChannelProviderFactory.getProvider(whatsapp) as MetaCloudApiChannelProvider;
  const templates = await channel.fetchTemplates();

  return res.status(200).json(templates);
};