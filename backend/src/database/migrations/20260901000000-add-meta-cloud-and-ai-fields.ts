import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Prompts", "provider", {
      type: DataTypes.STRING,
      defaultValue: "openai",
      allowNull: true
    });

    await queryInterface.addColumn("Prompts", "model", {
      type: DataTypes.STRING,
      defaultValue: "gpt-4o-mini",
      allowNull: true
    });

    await queryInterface.addColumn("Whatsapps", "phoneNumberId", {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Whatsapps", "wabaId", {
      type: DataTypes.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("Whatsapps", "apiVersion", {
      type: DataTypes.STRING,
      defaultValue: "v20.0",
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Prompts", "provider");
    await queryInterface.removeColumn("Prompts", "model");
    await queryInterface.removeColumn("Whatsapps", "phoneNumberId");
    await queryInterface.removeColumn("Whatsapps", "wabaId");
    await queryInterface.removeColumn("Whatsapps", "apiVersion");
  }
};
