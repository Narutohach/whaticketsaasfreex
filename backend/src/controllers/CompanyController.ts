import { Request, Response } from "express";
import * as Yup from "yup";
// import { getIO } from "../libs/socket";
import authConfig from "../config/auth";
import AppError from "../errors/AppError";
import Company from "../models/Company";
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

  return res.status(200).json(company);
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