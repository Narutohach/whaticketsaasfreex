import { QueryInterface, DataTypes } from "sequelize";

interface ExistingColumns {
  [key: string]: any;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo: ExistingColumns = await queryInterface.describeTable(
      "Plans"
    );

    if (!tableInfo.useGemini) {
      await queryInterface.addColumn("Plans", "useGemini", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    if (!tableInfo.maxTokensMonthly) {
      await queryInterface.addColumn("Plans", "maxTokensMonthly", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Plans", "useGemini");
    await queryInterface.removeColumn("Plans", "maxTokensMonthly");
  }
};
