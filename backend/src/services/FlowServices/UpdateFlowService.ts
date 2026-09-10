import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Flow, { FlowNode, FlowEdge } from "../../models/Flow";
import ShowFlowService from "./ShowFlowService";

interface FlowData {
  name?: string;
  description?: string;
  isActive?: boolean;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
  triggerKeyword?: string;
}

interface Request {
  flowId: string | number;
  flowData: FlowData;
  companyId: string | number;
}

const UpdateFlowService = async ({
  flowId,
  flowData,
  companyId
}: Request): Promise<Flow> => {
  const flow = await ShowFlowService({ flowId, companyId });

  const { name, description, isActive, nodes, edges, viewport, triggerKeyword } = flowData;

  if (name != null) {
    const schema = Yup.object().shape({
      name: Yup.string().min(2, "ERR_FLOW_INVALID_NAME").required("ERR_FLOW_INVALID_NAME")
    });

    try {
      await schema.validate({ name });
    } catch (err: any) {
      throw new AppError(err.message);
    }
  }

  await flow.update({
    name: name ?? flow.name,
    description: description !== undefined ? description : flow.description,
    isActive: isActive ?? flow.isActive,
    nodes: nodes ?? flow.nodes,
    edges: edges ?? flow.edges,
    viewport: viewport ?? flow.viewport,
    triggerKeyword: triggerKeyword !== undefined ? triggerKeyword : flow.triggerKeyword
  });

  await flow.reload();
  return flow;
};

export default UpdateFlowService;
