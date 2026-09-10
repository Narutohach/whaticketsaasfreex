import { QueryInterface, DataTypes } from "sequelize";

interface ExistingTables {
  [key: string]: any;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = "Flows";

    const existingTables: ExistingTables = await queryInterface.showAllTables();

    if (!existingTables.includes(table)) {
      await queryInterface.createTable(table, {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        triggerKeyword: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        nodes: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: []
        },
        edges: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: []
        },
        viewport: {
          type: DataTypes.JSONB,
          allowNull: true
        },
        companyId: {
          type: DataTypes.INTEGER,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false
        },
        userId: {
          type: DataTypes.INTEGER,
          references: { model: "Users", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          allowNull: true
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

      await queryInterface.addIndex(table, ["companyId"]);
    }
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Flows");
  }
};
