import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  AllowNull,
  DataType
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";

/**
 * Trilha de auditoria das ações administrativas sensíveis. Os registros são
 * somente de escrita/leitura — nunca atualizados pela aplicação — e jamais
 * devem guardar segredos (veja o sanitizador em CreateAuditLogService).
 */
@Table({ tableName: "AuditLogs" })
class AuditLog extends Model<AuditLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Nulo em ações que ocorrem fora de um tenant (ex.: criação de empresa).
  @AllowNull(true)
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  // Nulo quando o usuário é removido depois: o registro precisa sobreviver.
  @AllowNull(true)
  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  // Cópia desnormalizada do e-mail do autor da ação.
  @AllowNull(true)
  @Column
  userEmail: string;

  @Column
  action: string;

  @Column
  entity: string;

  @AllowNull(true)
  @Column
  entityId: string;

  @AllowNull(true)
  @Column({
    type: DataType.JSONB
  })
  metadata: Record<string, any>;

  @AllowNull(true)
  @Column
  ip: string;

  @AllowNull(true)
  @Column
  userAgent: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default AuditLog;
