import { Op } from "sequelize";
import Flow from "../../models/Flow";
import User from "../../models/User";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  companyId: string | number;
}

interface Response {
  flows: Flow[];
  count: number;
  hasMore: boolean;
}

const ListFlowsService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  if (searchParam) {
    whereCondition = {
      [Op.or]: [{ name: { [Op.iLike]: `%${searchParam}%` } }]
    };
  }

  const { count, rows: flows } = await Flow.findAndCountAll({
    where: { ...whereCondition, companyId },
    attributes: { exclude: ["nodes", "edges", "viewport"] },
    include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    limit,
    offset,
    order: [["updatedAt", "DESC"]]
  });

  const hasMore = count > offset + flows.length;

  return { flows, count, hasMore };
};

export default ListFlowsService;
