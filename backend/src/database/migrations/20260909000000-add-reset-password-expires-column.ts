import { QueryInterface, DataTypes } from "sequelize";

interface ExistingColumns {
  [key: string]: any;
}

/**
 * O token de redefinição de senha (resetPassword, ver
 * 20231111185822-add_reset_password_column) nunca teve prazo de validade —
 * só era invalidado quando usado. Um link de "esqueci minha senha" gerado
 * uma vez ficava válido para sempre até alguém usá-lo ou pedir um novo.
 */
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo: ExistingColumns = await queryInterface.describeTable(
      "Users"
    );

    if (tableInfo.resetPasswordExpires) {
      return;
    }

    await queryInterface.addColumn("Users", "resetPasswordExpires", {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Users", "resetPasswordExpires");
  }
};
