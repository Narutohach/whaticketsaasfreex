import "../bootstrap";

/**
 * O projeto é Postgres: as migrations usam JSONB e há SQL bruto com
 * identificadores entre aspas duplas. O default anterior era mysql/3306, o que
 * fazia uma instalação sem DB_DIALECT tentar subir num banco onde o código não
 * funciona. charset/collate só existem no mysql, então são aplicados apenas lá.
 */
const dialect = process.env.DB_DIALECT || "postgres";

const defaultPort = dialect === "mysql" || dialect === "mariadb" ? 3306 : 5432;

module.exports = {
  ...(dialect === "mysql" || dialect === "mariadb"
    ? {
        define: {
          charset: "utf8mb4",
          collate: "utf8mb4_bin"
        }
      }
    : {}),
  dialect,
  timezone: "-03:00",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || defaultPort,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: process.env.DB_DEBUG === "true"
};
