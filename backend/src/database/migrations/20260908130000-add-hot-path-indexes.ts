import { QueryInterface } from "sequelize";

/**
 * Índices nas colunas mais filtradas/ordenadas dos caminhos quentes. Antes
 * disso, a listagem de tickets (`ListTicketsService`, ordenada por
 * `updatedAt DESC`) e a de mensagens (ordenada por `createdAt DESC`) faziam
 * seq scan + sort na tabela inteira; o índice que existia em Messages é
 * `(companyId, ticketId)`, que não cobre a ordenação.
 *
 * `CONCURRENTLY` para não travar escrita nas tabelas em produção — por isso
 * cada comando roda solto, fora de transação (o Postgres não permite
 * CONCURRENTLY dentro de transação). `IF NOT EXISTS` deixa a migration
 * reexecutável.
 */
const INDEXES: { name: string; sql: string }[] = [
  {
    name: "idx_tickets_company_status_updated",
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_company_status_updated ON "Tickets" ("companyId", "status", "updatedAt" DESC)`
  },
  {
    name: "idx_tickets_company_user",
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_company_user ON "Tickets" ("companyId", "userId")`
  },
  {
    name: "idx_tickets_queue",
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_queue ON "Tickets" ("queueId")`
  },
  {
    name: "idx_tickets_contact",
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickets_contact ON "Tickets" ("contactId")`
  },
  {
    name: "idx_messages_ticket_created",
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_ticket_created ON "Messages" ("ticketId", "createdAt" DESC)`
  },
  {
    name: "idx_invoices_company_status",
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_company_status ON "Invoices" ("companyId", "status")`
  },
  {
    name: "idx_tickettraking_ticket",
    sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tickettraking_ticket ON "TicketTraking" ("ticketId")`
  }
];

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    for (const index of INDEXES) {
      // Sequencial de propósito: CONCURRENTLY em paralelo na mesma tabela
      // disputa lock e uma das criações falha.
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.sequelize.query(index.sql);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    for (const index of INDEXES) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.sequelize.query(
        `DROP INDEX CONCURRENTLY IF EXISTS ${index.name}`
      );
    }
  }
};
