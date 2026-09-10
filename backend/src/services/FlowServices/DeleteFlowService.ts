import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import ShowFlowService from "./ShowFlowService";

const DeleteFlowService = async (
  flowId: string | number,
  companyId: string | number
): Promise<void> => {
  const flow = await ShowFlowService({ flowId, companyId });

  const queuesUsingFlow = await Queue.count({ where: { flowId: flow.id } });

  if (queuesUsingFlow > 0) {
    throw new AppError("ERR_FLOW_IN_USE_BY_QUEUE", 400);
  }

  await flow.destroy();
};

export default DeleteFlowService;
