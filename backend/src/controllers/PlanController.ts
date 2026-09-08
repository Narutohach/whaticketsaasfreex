import * as Yup from "yup";
import { Request, Response } from "express";
// import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Plan from "../models/Plan";
import { registerAudit } from "../helpers/RegisterAudit";

import ListPlansService from "../services/PlanService/ListPlansService";
import CreatePlanService from "../services/PlanService/CreatePlanService";
import UpdatePlanService from "../services/PlanService/UpdatePlanService";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import FindAllPlanServiceRegister from "../services/PlanService/FindAllPlanServiceRegister";
import FindAllPlanService from "../services/PlanService/FindAllPlanService";
import DeletePlanService from "../services/PlanService/DeletePlanService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type StorePlanData = {
  name: string;
  id?: number | string;
  users: number | 0;
  connections: number | 0;
  queues: number | 0;
  value: number;
  useCampaigns?: boolean;
  useSchedules?: boolean;
  useInternalChat?: boolean;
  useExternalApi?: boolean;
  useKanban?: boolean;
  useOpenAi?: boolean;
  useIntegrations?: boolean;
  useInternal?: boolean;
};

type UpdatePlanData = {
  name: string;
  id?: number | string;
  users?: number;
  connections?: number;
  queues?: number;
  value?: number;
  useCampaigns?: boolean;
  useSchedules?: boolean;
  useInternalChat?: boolean;
  useExternalApi?: boolean;
  useKanban?: boolean;
  useOpenAi?: boolean;
  useIntegrations?: boolean;
  useInternal?: boolean;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { plans, count, hasMore } = await ListPlansService({
    searchParam,
    pageNumber
  });

  return res.json({ plans, count, hasMore });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const plans: Plan[] = await FindAllPlanService();

  return res.status(200).json(plans);
};

export const register = async (req: Request, res: Response): Promise<Response> => {
    const plans: Plan[] = await FindAllPlanServiceRegister();
  
    return res.status(200).json(plans);
  };
  

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newPlan: StorePlanData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().required()
  });

  try {
    await schema.validate(newPlan);
  } catch (err) {
    throw new AppError(err.message);
  }

  const plan = await CreatePlanService(newPlan);

  await registerAudit(req, {
    action: "plan.create",
    entity: "plan",
    entityId: plan.id,
    metadata: {
      name: newPlan.name,
      users: newPlan.users,
      connections: newPlan.connections,
      queues: newPlan.queues,
      value: newPlan.value
    }
  });

  // const io = getIO();
  // io.emit("plan", {
  //   action: "create",
  //   plan
  // });

  return res.status(200).json(plan);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const plan = await ShowPlanService(id);

  return res.status(200).json(plan);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const planData: UpdatePlanData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string()
  });

  try {
    await schema.validate(planData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const plan = await UpdatePlanService(planData);

  await registerAudit(req, {
    action: "plan.update",
    entity: "plan",
    entityId: planData.id,
    metadata: {
      changes: planData
    }
  });

  // const io = getIO();
  // io.emit("plan", {
  //   action: "update",
  //   plan
  // });

  return res.status(200).json(plan);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const plan = await DeletePlanService(id);

  await registerAudit(req, {
    action: "plan.delete",
    entity: "plan",
    entityId: id
  });

  return res.status(200).json(plan);
};
