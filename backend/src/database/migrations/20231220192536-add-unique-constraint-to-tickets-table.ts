import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Operador vírgula: a versão anterior não esperava o removeConstraint
    // antes de disparar o addConstraint, então as duas rodavam em paralelo —
    // corrida real contra o mesmo nome de constraint, resultado
    // não-determinístico (às vezes "already exists", às vezes ok).
    try {
      await queryInterface.removeConstraint(
        "Tickets",
        "contactid_companyid_unique"
      );
    } catch (err) {
      // Instalação nova: a constraint com esse nome nunca existiu.
    }

    return queryInterface.addConstraint("Tickets", {
      fields: ["contactId", "companyId", "whatsappId"],
      type: "unique",
      name: "contactid_companyid_unique"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeConstraint(
      "Tickets",
      "contactid_companyid_unique"
    );
  }
};
