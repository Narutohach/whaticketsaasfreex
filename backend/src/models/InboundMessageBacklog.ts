import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
  DataType
} from "sequelize-typescript";

import Company from "./Company";
import Whatsapp from "./Whatsapp";

/**
 * Ver helpers/InboundMessageDurability.ts — registro transitório de "mensagem
 * recebida, ainda não confirmada como processada". Linhas de sucesso são
 * apagadas; só pending (recém-chegada) e failed (esgotou tentativas) ficam.
 */
@Table({ tableName: "InboundMessageBacklog" })
class InboundMessageBacklog extends Model<InboundMessageBacklog> {
  // O próprio wamid — mesma chave usada em Message.id.
  @PrimaryKey
  @Column
  id: string;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @AllowNull(true)
  @Column
  messageType: string;

  // Só preenchido para mensagens de texto puro — ver o comentário na migration.
  @AllowNull(true)
  @Column(DataType.TEXT)
  rawJson: string;

  @Default("pending")
  @Column
  status: "pending" | "done" | "failed";

  @Default(0)
  @Column
  attempts: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  lastError: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default InboundMessageBacklog;
