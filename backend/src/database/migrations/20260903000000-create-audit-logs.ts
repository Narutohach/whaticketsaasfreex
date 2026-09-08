import { QueryInterface, DataTypes } from "sequelize";

interface ExistingTables {
  [key: string]: any;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = "AuditLogs";

    const existingTables: ExistingTables = await queryInterface.showAllTables();

    if (existingTables.includes(table)) {
      return;
    }

    await queryInterface.createTable(table, {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      // Nulo de propósito: ações como a criação de uma empresa acontecem
      // antes de existir um tenant ao qual vincular o registro.
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      // SET NULL para que a trilha sobreviva à exclusão do usuário.
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      // E-mail desnormalizado: identifica o autor mesmo depois que o
      // usuário for removido.
      userEmail: {
        type: DataTypes.STRING,
        allowNull: true
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      entity: {
        type: DataTypes.STRING,
        allowNull: false
      },
      entityId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userAgent: {
        type: DataTypes.STRING,
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

    await queryInterface.addIndex(table, ["companyId"], {
      name: "idx_audit_company_id"
    });

    await queryInterface.addIndex(table, ["action"], {
      name: "idx_audit_action"
    });

    // Índice da listagem: filtra pela empresa e ordena pelo mais recente.
    await queryInterface.addIndex(table, ["companyId", "createdAt"], {
      name: "idx_audit_company_id_created_at"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("AuditLogs");
  }
};
