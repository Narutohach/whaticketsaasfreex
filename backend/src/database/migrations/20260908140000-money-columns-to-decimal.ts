import { QueryInterface } from "sequelize";

/**
 * `Plans.value` e `Invoices.value` eram `FLOAT` (float4 no Postgres, ~7 dígitos
 * significativos). Valor monetário em float não é representável exatamente:
 * 29.90 é armazenado como 29.899999618530273, somas de faturas divergem por
 * centavos e o valor cobrado deixa de bater com o exibido.
 *
 * A conversão é feita com `USING ... ::numeric(12,2)`, que arredonda para 2
 * casas — ou seja, os valores existentes são normalizados para o centavo mais
 * próximo, o que é justamente o que se quer aqui.
 *
 * O `down` volta para float por completude, mas a volta é lossy: os centavos
 * arredondados não são restaurados.
 */
const COLUMNS = [
  { table: "Plans", column: "value" },
  { table: "Invoices", column: "value" }
];

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    for (const { table, column } of COLUMNS) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.sequelize.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE DECIMAL(12,2) USING "${column}"::numeric(12,2)`
      );
    }
  },

  down: async (queryInterface: QueryInterface) => {
    for (const { table, column } of COLUMNS) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.sequelize.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE DOUBLE PRECISION USING "${column}"::double precision`
      );
    }
  }
};
