import { QueryInterface, DataTypes } from "sequelize";

interface ExistingColumns {
  [key: string]: any;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo: ExistingColumns = await queryInterface.describeTable("Queues");

    if (!tableInfo.flowId) {
      await queryInterface.addColumn("Queues", "flowId", {
        type: DataTypes.INTEGER,
        references: { model: "Flows", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      });
    }
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "flowId");
  }
};
