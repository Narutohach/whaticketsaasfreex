import { Request, Response } from "express";
import * as Yup from "yup";
// import { getIO } from "../libs/socket";
import authConfig from "../config/auth";
import AppError from "../errors/AppError";
import Company from "../models/Company";
import Plan from "../models/Plan";
import { addDays } from "date-fns";
import { getGlobalSettingValue } from "../helpers/PublicSettings";
import { registerAudit } from "../helpers/RegisterAudit";
import fs from "fs";
import path from "path";
import { verify } from "jsonwebtoken";
import User from "../models/User";
import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import DeleteCompanyService from "../services/CompanyService/DeleteCompanyService";
import FindAllCompaniesService from "../services/CompanyService/FindAllCompaniesService";
import ListCompaniesPlanService from "../services/CompanyService/ListCompaniesPlanService";
import ListCompaniesService from "../services/CompanyService/ListCompaniesService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import ShowPlanCompanyService from "../services/CompanyService/ShowPlanCompanyService";
import UpdateCompanyService from "../services/CompanyService/UpdateCompanyService";
import UpdateSchedulesService from "../services/CompanyService/UpdateSchedulesService";

const publicFolder = path.resolve(__dirname, "..", "..", "public");

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

type CompanyData = {
  name: string;
  id?: number;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
};

type SchedulesData = {
  schedules: [];
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { companies, count, hasMore } = await ListCompaniesService({
    searchParam,
    pageNumber
  });

  return res.json({ companies, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newCompany: CompanyData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().trim().required("ERR_COMPANY_NAME_REQUIRED"),
    email: Yup.string().email().notRequired(),
    phone: Yup.string().notRequired(),
    password: Yup.string().min(6).notRequired()
  });

  try {
    await schema.validate(newCompany);
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  const company = await CreateCompanyService(newCompany);

  await registerAudit(req, {
    action: "company.create",
    entity: "company",
    entityId: company.id,
    companyId: company.id,
    metadata: {
      name: newCompany.name,
      email: newCompany.email,
      planId: newCompany.planId,
      status: newCompany.status,
      recurrence: newCompany.recurrence,
      dueDate: newCompany.dueDate
    }
  });

  return res.status(200).json(company);
};

/**
 * Cadastro público (self-service). Diferente de `store`, aqui nada que tenha
 * valor comercial pode vir do cliente: plano, vencimento, status e recorrência
 * são definidos pelo servidor. Antes desta separação era possível criar uma
 * empresa anônima no plano mais caro com vencimento em 2099.
 */
export const publicStore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, email, phone, password, planId } = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().trim().min(2).required("ERR_COMPANY_NAME_REQUIRED"),
    email: Yup.string().email().required("ERR_COMPANY_EMAIL_REQUIRED"),
    phone: Yup.string().trim().notRequired(),
    password: Yup.string().min(6).required("ERR_COMPANY_PASSWORD_REQUIRED"),
    planId: Yup.number().integer().positive().required("ERR_PLAN_REQUIRED")
  });

  try {
    await schema.validate({ name, email, phone, password, planId });
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  // A checagem de cadastro liberado existia apenas no frontend.
  const allowRegister = await getGlobalSettingValue("allowregister", "enabled");

  if (allowRegister === "disabled") {
    throw new AppError("ERR_REGISTER_DISABLED", 403);
  }

  // Só planos marcados como disponíveis para autoatendimento (os mesmos que
  // GET /plans/register expõe na tela de cadastro).
  const plan = await Plan.findOne({
    where: { id: Number(planId), useInternal: true }
  });

  if (!plan) {
    throw new AppError("ERR_INVALID_PLAN", 400);
  }

  const trialDays = Number(await getGlobalSettingValue("trial", "3")) || 3;

  const company = await CreateCompanyService({
    name,
    email,
    phone,
    password,
    planId: plan.id,
    status: true,
    recurrence: "MENSAL",
    dueDate: addDays(new Date(), trialDays).toISOString(),
    campaignsEnabled: !!plan.useCampaigns
  });

  // Cadastro anônimo: não há req.user, então a trilha guarda apenas a
  // empresa criada, o IP e o user-agent de origem.
  await registerAudit(req, {
    action: "company.signup",
    entity: "company",
    entityId: company.id,
    companyId: company.id,
    metadata: {
      name,
      email,
      planId: plan.id,
      trialDays
    }
  });

  return res.status(200).json({ id: company.id, name: company.name });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId, super: isSuper } = req.user;

  if (!isSuper && companyId.toString() !== id.toString()) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const company = await ShowCompanyService(id);

  return res.status(200).json(company);
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const companies: Company[] = await FindAllCompaniesService();

  return res.status(200).json(companies);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyData: CompanyData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string()
  });

  try {
    await schema.validate(companyData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { id } = req.params;

  const company = await UpdateCompanyService({ id, ...companyData });

  await registerAudit(req, {
    action: "company.update",
    entity: "company",
    entityId: id,
    metadata: {
      targetCompanyId: id,
      // O sanitizador remove `password` caso venha no corpo.
      changes: companyData
    }
  });

  return res.status(200).json(company);
};

export const updateSchedules = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { schedules }: SchedulesData = req.body;
  const { id } = req.params;
  const { companyId, super: isSuper } = req.user;

  if (!isSuper && companyId.toString() !== id.toString()) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const company = await UpdateSchedulesService({
    id,
    schedules
  });

  await registerAudit(req, {
    action: "company.update_schedules",
    entity: "company",
    entityId: id,
    metadata: {
      targetCompanyId: id,
      schedulesCount: Array.isArray(schedules) ? schedules.length : 0
    }
  });

  return res.status(200).json(company);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = req.user.id;
  const requestUser = await User.findByPk(userId);

  if (!requestUser || !requestUser.super) {
    throw new AppError("você nao tem permissão para esta ação!", 403);
  }
  const { id } = req.params;

  if (fs.existsSync(`${publicFolder}/company${id}/`)) {
    await fs.rmdirSync(`${publicFolder}/company${id}/`, {
      recursive: true,
    });
  }

  const company = await DeleteCompanyService(id);

  await registerAudit(req, {
    action: "company.delete",
    entity: "company",
    entityId: id,
    // A empresa deixou de existir: o registro fica vinculado ao tenant do
    // autor (super admin) para não apontar para uma FK removida.
    metadata: {
      targetCompanyId: id
    }
  });

  return res.status(200).json(company);
};

export const listPlan = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId, super: isSuper } = req.user;

  if (isSuper || companyId.toString() === id.toString()) {
    const company = await ShowPlanCompanyService(id);
    return res.status(200).json(company);
  }

  throw new AppError("Você não possui permissão para acessar este recurso!", 403);
};

export const indexPlan = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { super: isSuper } = req.user;

  if (!isSuper) {
    throw new AppError("Você não possui permissão para acessar este recurso!", 403);
  }

  const companies = await ListCompaniesPlanService();
  return res.json({ companies });
};