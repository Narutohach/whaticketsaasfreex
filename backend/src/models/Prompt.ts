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
  UpdatedAt
} from "sequelize-typescript";
import Queue from "./Queue";
import Company from "./Company";

@Table
class Prompt extends Model<Prompt> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column
  prompt: string;

  @AllowNull(false)
  @Column
  apiKey: string;

  @Column({ defaultValue: "openai" })
  provider: string;

  @Column({ defaultValue: "gpt-4o-mini" })
  model: string;

  @Column({ defaultValue: 10 })
  maxMessages: number;

  @Column({ defaultValue: 100 })
  maxTokens: number;

  @Column({ defaultValue: 1 })
  temperature: number;

  @Column({ defaultValue: 0 })
  promptTokens: number;

  @Column({ defaultValue: 0 })
  completionTokens: number;

  @Column({ defaultValue: 0 })
  totalTokens: number;

  @AllowNull(false)
  @Column
  voice: string;

  @AllowNull(true)
  @Column
  voiceKey:string;

  @AllowNull(true)
  @Column
  voiceRegion:string;

  @AllowNull
  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  /**
   * Prompt usado como último fallback para tickets que não têm prompt de fila
   * nem de conexão (ver helpers/ResolveAIPrompt.ts). Único por empresa — a
   * exclusividade é garantida nos services de criação/edição, não no banco.
   */
  @Default(false)
  @Column
  isDefault: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

/**
 * Campos que nunca devem sair em resposta de API nem em evento de socket: são
 * as credenciais do provedor de IA. Ficam disponíveis apenas para quem executa
 * a IA no servidor (ver services/AI/ExecuteAIService).
 */
export const PROMPT_SECRET_ATTRIBUTES = ["apiKey", "voiceKey"];

export default Prompt;
