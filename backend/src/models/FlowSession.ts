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
import Flow from "./Flow";
import Ticket from "./Ticket";

export type FlowSessionStatus = "running" | "waiting_input" | "completed" | "stopped";

@Table
class FlowSession extends Model<FlowSession> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Flow)
  @AllowNull(false)
  @Column
  flowId: number;

  @BelongsTo(() => Flow)
  flow: Flow;

  @ForeignKey(() => Ticket)
  @AllowNull(false)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  // Nó onde a execução está parada agora. Null quando a sessão já terminou.
  @Column
  currentNodeId: string;

  // Quando status === "waiting_input", em qual variável salvar a próxima
  // resposta do contato antes de retomar a partir de currentNodeId.
  @Column
  waitingVariable: string;

  @Default("running")
  @Column
  status: FlowSessionStatus;

  @Default({})
  @Column(DataType.JSONB)
  variables: Record<string, any>;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default FlowSession;
