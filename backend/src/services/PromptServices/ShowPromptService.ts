import AppError from "../../errors/AppError";
import Prompt, { PROMPT_SECRET_ATTRIBUTES } from "../../models/Prompt";
import Queue from "../../models/Queue";

interface Data {
  promptId: string | number;
  companyId: string | number;
}
const ShowPromptService = async ({ promptId, companyId }: Data): Promise<Prompt> => {

  const prompt = await Prompt.findOne({
    where: {
      id: promptId,
      companyId
    },
    attributes: { exclude: PROMPT_SECRET_ATTRIBUTES },
    include: [
      {
        model: Queue,
        as: "queue"
      }
    ]
  });

  if (!prompt) {
    throw new AppError("ERR_NO_PROMPT_FOUND", 404);
  }

  return prompt;
};
export default ShowPromptService;
