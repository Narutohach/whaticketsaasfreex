import { QueryInterface, DataTypes } from "sequelize";

interface ExistingTables {
  [key: string]: any;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = "FlowSessions";

    const existingTables: ExistingTables = await queryInterface.showAllTables();

    if (!existingTables.includes(table)) {
      await queryInterface.createTable(table, {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        flowId: {
          type: DataTypes.INTEGER,
          references: { model: "Flows", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false
        },
        ticketId: {
          type: DataTypes.INTEGER,
          references: { model: "Tickets", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false
        },
        companyId: {
          type: DataTypes.INTEGER,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: true
        },
        currentNodeId: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        waitingVariable: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        status: {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: "running"
        },
        variables: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {}
        },
        createdAt: {
          type: DataTypes.DATE(6),
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE(6),
          allowNull: false
        }
      });

      // Uma sessão de fluxo ativa por ticket — busca no hot-path do
      // recebimento de mensagem (ver FlowEngineService).
      await queryInterface.addIndex(table, ["ticketId", "status"]);
    }
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("FlowSessions");
  }
};
