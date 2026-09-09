import { Request, Response } from "express";
import express from "express";
import * as Yup from "yup";
import Gerencianet from "gn-api-sdk-typescript";
import AppError from "../errors/AppError";

import options from "../config/Gn";
import Company from "../models/Company";
import Invoices from "../models/Invoices";
import Subscriptions from "../models/Subscriptions";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";
import sequelize from "../database";
import UpdateUserService from "../services/UserServices/UpdateUserService";

const app = express();


export const index = async (req: Request, res: Response): Promise<Response> => {
  const gerencianet = Gerencianet(options);
  return res.json(gerencianet.getSubscriptions());
};

export const createSubscription = async (
  req: Request,
  res: Response
  ): Promise<Response> => {
    const gerencianet = Gerencianet(options);
    const { companyId } = req.user;

  const schema = Yup.object().shape({
    price: Yup.string().required(),
    users: Yup.string().required(),
    connections: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const {
    firstName,
    price,
    users,
    connections,
    address2,
    city,
    state,
    zipcode,
    country,
    plan,
    invoiceId
  } = req.body;
  

  const body = {
    calendario: {
      expiracao: 3600
    },
    valor: {
      original: price.toLocaleString("pt-br", { minimumFractionDigits: 2 }).replace(",", ".")
    },
    chave: process.env.GERENCIANET_PIX_KEY,
    solicitacaoPagador: `#Fatura:${invoiceId}`
    };
  try {
    const pix = await gerencianet.pixCreateImmediateCharge(null, body);

    const qrcode = await gerencianet.pixGenerateQRCode({
      id: pix.loc.id
    });

    const updateCompany = await Company.findOne();

    if (!updateCompany) {
      throw new AppError("Company not found", 404);
    }


/*     await Subscriptions.create({
      companyId,
      isActive: false,
      userPriceCents: users,
      whatsPriceCents: connections,
      lastInvoiceUrl: pix.location,
      lastPlanChange: new Date(),
      providerSubscriptionId: pix.loc.id,
      expiresAt: new Date()
    }); */

/*     const { id } = req.user;
    const userData = {};
    const userId = id;
    const requestUserId = parseInt(id);
    const user = await UpdateUserService({ userData, userId, companyId, requestUserId }); */

    /*     const io = getIO();
        io.emit("user", {
          action: "update",
          user
        }); */


    return res.json({
      ...pix,
      qrcode,

    });
  } catch (error) {
    throw new AppError("Validation fails", 400);
  }
};

export const createWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required(),
    url: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave, url } = req.body;

  const body = {
    webhookUrl: url
  };

  const params = {
    chave
  };

  try {
    const gerencianet = Gerencianet(options);
    const create = await gerencianet.pixConfigWebhook(params, body);
    return res.json(create);
  } catch (error) {
    // Somente a mensagem: o erro do axios carrega as credenciais do Gerencianet
    // no config.headers e a chave Pix do cliente no corpo da requisicao.
    logger.error(
      `[SubscriptionController] Falha ao configurar webhook Pix: ${error?.message}`
    );
  }
};

export const webhook = async (
  req: Request,
  res: Response
  ): Promise<Response> => {
  const { type } = req.params;
  const { evento } = req.body;
  if (evento === "teste_webhook") {
    return res.json({ ok: true });
  }
  if (req.body.pix) {
    const gerencianet = Gerencianet(options);

    // `forEach(async)` não era aguardado: respondíamos 200 antes de processar,
    // então uma falha aqui não fazia o provedor reenviar a notificação — o
    // pagamento se perdia. E qualquer erro (ex.: txid desconhecido, fatura
    // inexistente) virava unhandledRejection, que derrubava o processo inteiro.
    // Este é um endpoint público, ou seja, era queda provocável de fora.
    await Promise.all(
      req.body.pix.map(async (pix: any) => {
        try {
          await processPixPayment(gerencianet, pix);
        } catch (err) {
          logger.error(
            `Falha ao processar pix ${pix?.txid}: ${(err as Error)?.message}`
          );
        }
      })
    );
  }

  return res.json({ ok: true });
};

const processPixPayment = async (
  gerencianet: any,
  pix: any
): Promise<void> => {
  const detahe = await gerencianet.pixDetailCharge({ txid: pix.txid });

  if (detahe.status !== "CONCLUIDA") {
    return;
  }

  const { solicitacaoPagador } = detahe;
  const invoiceID = solicitacaoPagador?.replace("#Fatura:", "");
  const invoice = invoiceID ? await Invoices.findByPk(invoiceID) : null;

  if (!invoice) {
    logger.warn(`Pix ${pix?.txid}: fatura ${invoiceID} não encontrada.`);
    return;
  }

  // Idempotência: o provedor reenvia a notificação até receber 200, e sem esta
  // checagem cada reenvio estendia o vencimento em outros 30 dias.
  if (invoice.status === "paid") {
    logger.info(`Pix ${pix?.txid}: fatura ${invoice.id} já estava paga.`);
    return;
  }

  const company = await Company.findByPk(invoice.companyId);

  if (!company) {
    logger.warn(`Pix ${pix?.txid}: empresa ${invoice.companyId} não existe.`);
    return;
  }

  const expiresAt = new Date(company.dueDate);
  expiresAt.setDate(expiresAt.getDate() + 30);
  const date = expiresAt.toISOString().split("T")[0];

  // Transação: sem ela, uma falha entre os dois updates deixava a empresa com
  // vencimento estendido e a fatura ainda aberta (ou o inverso).
  await sequelize.transaction(async transaction => {
    // `status: true` reativa a empresa: o cron de faturamento (queues.ts)
    // desliga essa flag 3 dias após o vencimento, e sem religá-la aqui quem
    // pagasse depois de ser suspenso continuaria suspenso para sempre.
    await company.update({ dueDate: date, status: true }, { transaction });
    await invoice.update({ status: "paid" }, { transaction });
  });

  await company.reload();

  const io = getIO();
  io.to(`company-${company.id}-mainchannel`).emit(
    `company-${company.id}-payment`,
    {
      action: detahe.status,
      company
    }
  );
};
