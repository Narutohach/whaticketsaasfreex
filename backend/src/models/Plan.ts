import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  DataType
} from "sequelize-typescript";

@Table
class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @Column
  users: number;

  @Column
  connections: number;

  @Column
  queues: number;

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
  useSchedules: boolean;   

  @Column
  useCampaigns: boolean; 
  
  @Column
  useInternalChat: boolean;   
  
  @Column
  useExternalApi: boolean;   

  @Column
  useKanban: boolean;

  @Column
  useOpenAi: boolean;

  @Column
  useGemini: boolean;

  @Column
  maxTokensMonthly: number;

  @Column
  useIntegrations: boolean;
  
  @Column
  useInternal: boolean; 
}

export default Plan;
