import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  HasMany,
  Unique,
  DataType
} from "sequelize-typescript";

@Table({ tableName: "Invoices" })
class Invoices extends Model<Invoices> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  detail: string;

  @Column
  status: string;

  /**
   * O driver pg devolve DECIMAL como string para não perder precisão. Sem este
   * getter, `value` chegaria como "29.90" e quebraria a formatação de moeda no
   * frontend (String.prototype.toLocaleString ignora as opções de currency).
   */
  @Column({
    type: DataType.DECIMAL(12, 2),
    get(this: { getDataValue: (key: string) => unknown }): number | null {
      const raw = this.getDataValue("value");
      return raw === null || raw === undefined ? null : Number(raw);
    }
  })
  value: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  dueDate: string;

  @Column
  companyId: number;

}

export default Invoices;
