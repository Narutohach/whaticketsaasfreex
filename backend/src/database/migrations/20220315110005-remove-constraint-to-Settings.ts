import { QueryInterface, DataTypes } from "sequelize";

/**
 * As três operações são dependentes de ordem (limpar as linhas -> derrubar a
 * PK antiga em `key` -> criar a PK serial `id`) e estavam num `Promise.all`,
 * ou seja, disparadas em paralelo. O resultado era não-determinístico: se o
 * `addColumn` chegasse antes do `DELETE`/`removeConstraint`, a migration
 * falhava no meio, já com parte aplicada.
 *
 * O `DELETE FROM "Settings"` foi mantido de propósito: esta migration já rodou
 * em produção com essa semântica, e removê-la agora faria instalação nova
 * divergir das existentes. Numa cadeia limpa a tabela está vazia neste ponto
 * (os settings vêm dos seeds, que rodam depois das migrations), então o DELETE
 * é inócuo ali.
 *
 * ATENÇÃO: o `down` é destrutivo por natureza e não tem como não ser. Depois
 * desta migration, `key` deixou de ser único (settings passaram a ser por
 * empresa), então recriar a PK em `key` exige a tabela vazia. Rodar este
 * rollback apaga as configurações de todas as empresas.
 */
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('DELETE FROM "Settings"');
    await queryInterface.removeConstraint("Settings", "Settings_pkey");

    return queryInterface.addColumn("Settings", "id", {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('DELETE FROM "Settings"');
    await queryInterface.removeColumn("Settings", "id");

    return queryInterface.addConstraint("Settings", {
      fields: ["key"],
      type: "primary key",
      name: "Settings_pkey"
    });
  }
};
