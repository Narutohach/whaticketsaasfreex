import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Prompt from "../../models/Prompt";
import ShowPromptService from "./ShowPromptService";
import { encrypt } from "../../helpers/crypto";

interface PromptData {
    id?: number;
    name: string;
    apiKey: string;
    prompt: string;
    provider?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    queueId?: number;
    maxMessages?: number;
    companyId: string | number;
    voice?: string;
    voiceKey?: string;
    voiceRegion?: string;
    isDefault?: boolean;
}

interface Request {
    promptData: PromptData;
    promptId: string | number;
    companyId: string | number;
}

const UpdatePromptService = async ({
    promptId,
    promptData,
    companyId
}: Request): Promise<Prompt | undefined> => {
    const promptTable = await ShowPromptService({ promptId: promptId, companyId });

    const promptSchema = Yup.object().shape({
        name: Yup.string().required("ERR_PROMPT_NAME_INVALID"),
        prompt: Yup.string().required("ERR_PROMPT_PROMPT_INVALID"),
        // A apiKey não é mais devolvida ao cliente, então na edição ela chega
        // vazia quando o usuário não quer trocá-la: nesse caso a chave atual é
        // preservada e o campo não vai no update.
        apiKey: Yup.string().notRequired(),
        queueId: Yup.number().required("ERR_PROMPT_QUEUEID_INVALID"),
        maxMessages: Yup.number().required("ERR_PROMPT_MAX_MESSAGES_INVALID")
    });

    const { name, apiKey, prompt, provider, model, maxTokens, temperature, promptTokens, completionTokens, totalTokens, queueId, maxMessages, voice, voiceKey, voiceRegion, isDefault } = promptData;

    try {
        await promptSchema.validate({ name, apiKey, prompt, maxTokens, temperature, promptTokens, completionTokens, totalTokens, queueId, maxMessages });
    } catch (err: any) {
        // Serializar o erro do Yup inteiro devolvia o `value` validado ao
        // cliente — ou seja, a própria apiKey na mensagem de erro.
        throw new AppError(err.errors?.[0] || err.message || "ERR_PROMPT_INVALID", 400);
    }

    // Só sobrescreve as credenciais quando o usuário realmente informou uma
    // nova; campo vazio significa "manter a atual".
    const credentials: { apiKey?: string; voiceKey?: string } = {};

    if (apiKey) {
        credentials.apiKey = apiKey.includes(":") ? apiKey : encrypt(apiKey);
    }

    if (voiceKey) {
        credentials.voiceKey = voiceKey;
    }

    // Só uma empresa pode ter um prompt padrão por vez.
    if (isDefault) {
        await Prompt.update(
            { isDefault: false },
            { where: { companyId, id: { [Op.ne]: promptTable.id } } }
        );
    }

    await promptTable.update({
        name,
        ...credentials,
        prompt,
        provider: provider || promptTable.provider || "openai",
        model: model || promptTable.model || "gpt-4o-mini",
        maxTokens,
        temperature,
        promptTokens,
        completionTokens,
        totalTokens,
        queueId,
        maxMessages,
        voice,
        voiceRegion,
        isDefault: isDefault ?? promptTable.isDefault
    });
    await promptTable.reload();
    return promptTable;
};

export default UpdatePromptService;
