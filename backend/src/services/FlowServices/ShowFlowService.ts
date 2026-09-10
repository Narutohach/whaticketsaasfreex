import AppError from "../../errors/AppError";
import Flow from "../../models/Flow";

interface Data {
  flowId: string | number;
  companyId: string | number;
}

const ShowFlowService = async ({ flowId, companyId }: Data): Promise<Flow> => {
  const flow = await Flow.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("ERR_NO_FLOW_FOUND", 404);
  }

  return flow;
};

export default ShowFlowService;
