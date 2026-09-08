import { QueryInterface, DataTypes } from "sequelize";

interface ExistingColumns {
  [key: string]: any;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo: ExistingColumns = await queryInterface.describeTable(
      "Contacts"
    );

    if (tableInfo.isLid) {
      return Promise.resolve();
    }

    return queryInterface.addColumn("Contacts", "isLid", {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Contacts", "isLid");
  }
};
