import { QueryInterface, DataTypes } from "sequelize";

interface ExistingColumns {
  [key: string]: any;
}

const COLUMNS = [
  {
    name: "maxUseBotQueues",
    definition: { type: DataTypes.INTEGER, defaultValue: 3, allowNull: true }
  },
  {
    name: "expiresTicket",
    definition: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true }
  },
  {
    name: "expiresInactiveMessage",
    definition: { type: DataTypes.STRING, defaultValue: "", allowNull: true }
  },
  {
    name: "timeUseBotQueues",
    definition: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true }
  }
];

/**
 * Esta migration tinha dois bugs graves:
 *
 * 1. O `up` usava operador vírgula (`return A(), B(), C(), D();`), então só a
 *    ÚLTIMA coluna era aguardada — as outras três viravam fire-and-forget e a
 *    migration podia ser marcada como aplicada sem tê-las criado.
 *
 * 2. O `down` removia "companyId", coluna que este `up` nunca criou e que é a
 *    de isolamento multiempresa de Whatsapps. Um único `db:migrate:undo` nesta
 *    posição apagava o vínculo empresa↔conexão de TODAS as conexões,
 *    irrecuperável sem backup.
 */
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo: ExistingColumns = await queryInterface.describeTable(
      "Whatsapps"
    );

    for (const column of COLUMNS) {
      if (!tableInfo[column.name]) {
        // eslint-disable-next-line no-await-in-loop
        await queryInterface.addColumn("Whatsapps", column.name, column.definition);
      }
    }
  },

  down: async (queryInterface: QueryInterface) => {
    for (const column of COLUMNS) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.removeColumn("Whatsapps", column.name);
    }
  }
};
