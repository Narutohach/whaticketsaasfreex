/* eslint-disable import/no-extraneous-dependencies */
import { QueryTypes } from "sequelize";
import sequelize from "../../database";
import AppError from "../../errors/AppError";

export interface DashboardData {
  tickets: any[];
  totalTickets: any;
}

export interface Params {
  searchParam?: string;
  contactId?: string;
  whatsappId?: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  queueIds?: number[];
  tags?: number[];
  users?: number[];
  userId?: string;
}

const validDate = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

const numericIds = (value: unknown, field: string): number[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new AppError(`${field} inválido`, 400);

  const ids = value.map(Number);
  if (!ids.every(id => Number.isSafeInteger(id) && id > 0)) {
    throw new AppError(`${field} inválido`, 400);
  }
  return ids;
};

export default async function ListTicketsServiceReport(
  companyId: string | number,
  params: Params,
  page: number = 1,
  pageSize: number = 20
): Promise<DashboardData> {
  const safeCompanyId = Number(companyId);
  if (!Number.isSafeInteger(safeCompanyId) || safeCompanyId <= 0) {
    throw new AppError("Empresa inválida", 400);
  }

  const safePage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1;
  const safePageSize = Number.isSafeInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, 100)
    : 20;
  const offset = (safePage - 1) * safePageSize;
  const replacements: Record<string, any> = { companyId: safeCompanyId };
  const filters: string[] = ['t."companyId" = :companyId'];

  if (params.dateFrom !== undefined) {
    if (!validDate(params.dateFrom)) throw new AppError("Data inicial inválida", 400);
    replacements.dateFrom = `${params.dateFrom} 00:00:00`;
    filters.push('t."createdAt" >= :dateFrom');
  }

  if (params.dateTo !== undefined) {
    if (!validDate(params.dateTo)) throw new AppError("Data final inválida", 400);
    replacements.dateTo = `${params.dateTo} 23:59:59`;
    filters.push('t."createdAt" <= :dateTo');
  }

  const whatsappIds = numericIds(params.whatsappId, "WhatsApps");
  if (whatsappIds.length) {
    replacements.whatsappIds = whatsappIds;
    filters.push('t."whatsappId" IN (:whatsappIds)');
  }

  const userIds = numericIds(params.users, "Usuários");
  if (userIds.length) {
    replacements.userIds = userIds;
    filters.push('t."userId" IN (:userIds)');
  }

  const queueIds = numericIds(params.queueIds, "Filas");
  if (queueIds.length) {
    replacements.queueIds = queueIds;
    filters.push('COALESCE(t."queueId", 0) IN (:queueIds)');
  }

  const allowedStatuses = new Set(["open", "closed", "pending", "group"]);
  const statuses = params.status || [];
  if (!Array.isArray(statuses) || !statuses.every(status => allowedStatuses.has(status))) {
    throw new AppError("Status inválido", 400);
  }
  if (statuses.length) {
    replacements.statuses = statuses;
    filters.push('t."status" IN (:statuses)');
  }

  if (params.contactId !== undefined && params.contactId !== "") {
    const contactId = Number(params.contactId);
    if (!Number.isSafeInteger(contactId) || contactId <= 0) {
      throw new AppError("Contato inválido", 400);
    }
    replacements.contactId = contactId;
    filters.push('t."contactId" = :contactId');
  }

  const where = `WHERE ${filters.join(" AND ")}`;
  const query = `
    SELECT t.id, w."name" AS "whatsappName", c."name" AS "contactName",
      u."name" AS "userName", q."name" AS "queueName", t."lastMessage", t.uuid,
      CASE t.status
        WHEN 'open' THEN 'ABERTO' WHEN 'closed' THEN 'FECHADO'
        WHEN 'pending' THEN 'PENDENTE' WHEN 'group' THEN 'GRUPO'
      END AS "status",
      TO_CHAR(t."createdAt", 'DD/MM/YYYY HH24:MI') AS "createdAt",
      TO_CHAR(tt."finishedAt", 'DD/MM/YYYY HH24:MI') AS "closedAt"
    FROM "Tickets" t
    LEFT JOIN (
      SELECT DISTINCT ON ("ticketId") * FROM "TicketTraking"
      WHERE "companyId" = :companyId ORDER BY "ticketId", id DESC
    ) tt ON t.id = tt."ticketId"
    INNER JOIN "Contacts" c ON t."contactId" = c.id
    LEFT JOIN "Whatsapps" w ON t."whatsappId" = w.id
    LEFT JOIN "Users" u ON t."userId" = u.id
    LEFT JOIN "Queues" q ON t."queueId" = q.id
    ${where}`;

  const totalTicketsResult = await sequelize.query(
    `SELECT COUNT(*) AS total FROM "Tickets" t ${where}`,
    { replacements, type: QueryTypes.SELECT }
  );
  const totalTickets = totalTicketsResult[0];

  const tickets = await sequelize.query(
    `${query} ORDER BY t."createdAt" DESC LIMIT :limit OFFSET :offset`,
    {
      replacements: { ...replacements, limit: safePageSize, offset },
      type: QueryTypes.SELECT
    }
  );

  return { tickets, totalTickets };
}
