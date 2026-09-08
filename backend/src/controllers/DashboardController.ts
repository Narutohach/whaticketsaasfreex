import { Request, Response } from 'express';
import DashboardDataService, {
  DashboardData,
  Params,
} from '../services/ReportService/DashbardDataService';
import { TicketsAttendance } from '../services/ReportService/TicketsAttendance';
import { TicketsDayService } from '../services/ReportService/TicketsDayService';
import AppError from '../errors/AppError';

type IndexQuery = {
  initialDate: string;
  finalDate: string;
  companyId?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const params: Params = req.query;
  const { companyId } = req.user;

  const dashboardData: DashboardData = await DashboardDataService(
    companyId,
    params,
  );
  return res.status(200).json(dashboardData);
};

export const reportsUsers = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { initialDate, finalDate } = req.query as IndexQuery;
  const userCompanyId = req.user.companyId;

  let targetCompanyId = userCompanyId;
  if (req.user.super && req.query.companyId) {
    targetCompanyId = Number(req.query.companyId);
  }

  const { data } = await TicketsAttendance({
    initialDate,
    finalDate,
    companyId: targetCompanyId,
  });

  return res.json({ data });
};

export const reportsDay = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { initialDate, finalDate } = req.query as IndexQuery;
  const userCompanyId = req.user.companyId;

  let targetCompanyId = userCompanyId;
  if (req.user.super && req.query.companyId) {
    targetCompanyId = Number(req.query.companyId);
  }

  const { count, data } = await TicketsDayService({
    initialDate,
    finalDate,
    companyId: targetCompanyId,
  });

  return res.json({ count, data });
};
