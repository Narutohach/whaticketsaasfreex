import { QueryInterface, DataTypes } from "sequelize";

/**
 * Ver helpers/InboundMessageDurability.ts para o porquê desta tabela: a fila
 * de mensagens recebidas era só um array em memória, então uma queda do
 * processo entre o recebimento (o WhatsApp já considera entregue) e o
 * processamento perdia a mensagem em silêncio.
 */
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const existingTables = await queryInterface.showAllTables();

    if (existingTables.includes("InboundMessageBacklog")) {
      return;
    }

    await queryInterface.createTable("InboundMessageBacklog", {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      messageType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // Só preenchido para tipos seguros de reprocessar (texto puro): mídia
      // carrega mediaKey/fileEncSha256 como bytes binários que não sobrevivem
      // a um JSON.stringify/parse — replay automático quebraria o download.
      rawJson: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lastError: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex("InboundMessageBacklog", ["status", "updatedAt"], {
      name: "idx_inbound_backlog_status_updated"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("InboundMessageBacklog");
  }
};
