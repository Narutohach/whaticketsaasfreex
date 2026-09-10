import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

export interface FlowNodeData {
  [key: string]: any;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
}

@Table
class Flow extends Model<Flow> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Default(true)
  @Column
  isActive: boolean;

  // Palavra-chave que dispara o fluxo a qualquer momento da conversa
  // (checada antes da fila ser resolvida). Opcional — sem ela o fluxo só
  // roda quando atrelado a uma fila (Queue.flowId) ou disparado manualmente.
  @Column
  triggerKeyword: string;

  @Default([])
  @Column(DataType.JSONB)
  nodes: FlowNode[];

  @Default([])
  @Column(DataType.JSONB)
  edges: FlowEdge[];

  // Snapshot do viewport (zoom/posição) do canvas — só UX, não afeta execução.
  @Column(DataType.JSONB)
  viewport: { x: number; y: number; zoom: number };

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Flow;
