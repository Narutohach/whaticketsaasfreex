import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Flow, { FlowNode, FlowEdge } from "../../models/Flow";

interface Request {
  name: string;
  description?: string;
  companyId: number | string;
  userId?: number | string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  triggerKeyword?: string;
}

const DEFAULT_NODES: FlowNode[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 100, y: 200 },
    data: { label: "Início" }
  }
];

const CreateFlowService = async ({
  name,
  description,
  companyId,
  userId,
  nodes,
  edges,
  triggerKeyword
}: Request): Promise<Flow> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2, "ERR_FLOW_INVALID_NAME").required("ERR_FLOW_INVALID_NAME")
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const flow = await Flow.create({
    name,
    description,
    companyId: Number(companyId),
    userId: userId != null ? Number(userId) : undefined,
    nodes: nodes && nodes.length ? nodes : DEFAULT_NODES,
    edges: edges || [],
    triggerKeyword: triggerKeyword || undefined
  } as Flow);

  return flow;
};

export default CreateFlowService;
