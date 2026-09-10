import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateFlowService from "../services/FlowServices/CreateFlowService";
import DeleteFlowService from "../services/FlowServices/DeleteFlowService";
import ListFlowsService from "../services/FlowServices/ListFlowsService";
import ShowFlowService from "../services/FlowServices/ShowFlowService";
import UpdateFlowService from "../services/FlowServices/UpdateFlowService";
import { registerAudit } from "../helpers/RegisterAudit";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { flows, count, hasMore } = await ListFlowsService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.status(200).json({ flows, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { name, description, nodes, edges, triggerKeyword } = req.body;

  const flow = await CreateFlowService({
    name,
    description,
    companyId,
    userId,
    nodes,
    edges,
    triggerKeyword
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-flow`, {
    action: "create",
    flow
  });

  await registerAudit(req, {
    action: "flow.create",
    entity: "flow",
    entityId: flow.id,
    metadata: { name }
  });

  return res.status(200).json(flow);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;

  const flow = await ShowFlowService({ flowId, companyId });

  return res.status(200).json(flow);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;
  const flowData = req.body;

  const flow = await UpdateFlowService({ flowId, flowData, companyId });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-flow`, {
    action: "update",
    flow: { id: flow.id, name: flow.name, isActive: flow.isActive }
  });

  await registerAudit(req, {
    action: "flow.update",
    entity: "flow",
    entityId: flowId,
    metadata: { changedFields: Object.keys(flowData || {}) }
  });

  return res.status(200).json(flow);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { flowId } = req.params;
  const { companyId } = req.user;

  await DeleteFlowService(flowId, companyId);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-flow`, {
    action: "delete",
    flowId: +flowId
  });

  await registerAudit(req, {
    action: "flow.delete",
    entity: "flow",
    entityId: flowId
  });

  return res.status(200).json({ message: "Flow deleted" });
};
