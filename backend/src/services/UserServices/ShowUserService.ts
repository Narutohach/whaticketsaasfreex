import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";

/**
 * `companyId` deve ser informado sempre que a origem for uma requisição de
 * usuário: sem ele a busca é apenas por id e permite ler usuários de outra
 * empresa. Fica opcional apenas para os fluxos de autenticação, que resolvem a
 * identidade a partir do próprio token.
 */
const ShowUserService = async (
  id: string | number,
  companyId?: number
): Promise<User> => {
  const user = await User.findOne({
    where: companyId ? { id, companyId } : { id },
    attributes: [
      "name",
      "id",
      "email",
      "companyId",
      "profile",
      "super",
      "tokenVersion",
      "whatsappId",
	  "allTicket"
    ],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      { model: Company, as: "company", attributes: ["id", "name", "dueDate"] }
    ]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default ShowUserService;
