import AuditLog from "../../models/AuditLog";
import User from "../../models/User";

interface Request {
  companyId: number;
  action?: string;
  pageNumber?: string;
}

interface Response {
  logs: AuditLog[];
  count: number;
  hasMore: boolean;
}

const ListAuditLogsService = async ({
  companyId,
  action,
  pageNumber = "1"
}: Request): Promise<Response> => {
  // O companyId sempre vem resolvido pelo controller a partir do token —
  // nunca da query de um usuário não-super.
  const whereCondition: Record<string, any> = { companyId };

  if (action) {
    whereCondition.action = action;
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: logs } = await AuditLog.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
        required: false
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + logs.length;

  return {
    logs,
    count,
    hasMore
  };
};

export default ListAuditLogsService;
