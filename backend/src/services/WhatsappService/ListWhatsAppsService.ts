import { FindOptions } from "sequelize/types";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  companyId: number;
  session?: number | string;
  includeCredentials?: boolean;
}

const ListWhatsAppsService = async ({
  session,
  companyId,
  includeCredentials = false
}: Request): Promise<Whatsapp[]> => {
  const options: FindOptions = {
    where: {
      companyId
    },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ]
  };

  if (!includeCredentials) {
    options.attributes = { exclude: ["session", "token"] };
  }

  const whatsapps = await Whatsapp.findAll(options);

  return whatsapps;
};

export default ListWhatsAppsService;
