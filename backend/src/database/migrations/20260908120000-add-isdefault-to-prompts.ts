import { QueryInterface, DataTypes } from "sequelize";

interface ExistingColumns {
  [key: string]: any;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo: ExistingColumns = await queryInterface.describeTable(
      "Prompts"
    );

    if (tableInfo.isDefault) {
      return Promise.resolve();
    }

    return queryInterface.addColumn("Prompts", "isDefault", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Prompts", "isDefault");
  }
};
