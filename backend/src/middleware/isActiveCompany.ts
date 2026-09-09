import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import Company from "../models/Company";
import { logger } from "../utils/logger";

/**
 * Bloqueia o uso do produto por empresa suspensa.
 *
 * A flag `Company.status` é a fonte de verdade, não uma conta de data feita
 * aqui: quem a desliga é o cron de faturamento (queues.ts -> handleInvoiceCreate),
 * que já aplica carência de 3 dias após o vencimento e derruba as conexões de
 * WhatsApp. Refazer o cálculo de vencimento neste middleware criaria uma
 * segunda regra de negócio, possivelmente mais rígida que a real.
 *
 * O que este middleware fecha: até agora nada respeitava a suspensão fora do
 * ExecuteAIService, então bastava reconectar o WhatsApp (novo QR code) para
 * continuar operando normalmente sem pagar.
 *
 * Deliberadamente NÃO é aplicado nas rotas de autenticação, fatura, plano e
 * assinatura — sem elas o cliente inadimplente não conseguiria ver o que deve
 * nem pagar, o que tornaria a suspensão irreversível pelo próprio cliente.
 *
 * Super admin nunca é bloqueado: o dono da plataforma precisa conseguir entrar
 * para resolver justamente esses casos.
 */
const isActiveCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.companyId || req.user.super) {
      return next();
    }

    const company = await Company.findByPk(req.user.companyId, {
      attributes: ["id", "status"]
    });

    if (company && company.status === false) {
      throw new AppError("ERR_COMPANY_SUSPENDED", 402);
    }
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    // Falha aberta de propósito: um erro ao consultar a empresa não pode
    // trancar todos os clientes para fora do sistema.
    logger.warn(
      `isActiveCompany: falha ao verificar a empresa ${req.user?.companyId}: ${
        (err as Error)?.message
      }`
    );
  }

  return next();
};

export default isActiveCompany;
