import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Prompt from "../../models/Prompt";
import ShowPromptService from "./ShowPromptService";
import { encrypt } from "../../helpers/crypto";

interface PromptData {
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

const CreatePromptService = async (promptData: PromptData): Promise<Prompt> => {
    const { name, apiKey, prompt, queueId, maxMessages, companyId } = promptData;

    const promptSchema = Yup.object().shape({
        name: Yup.string().required("ERR_PROMPT_NAME_INVALID"),
        prompt: Yup.string().required("ERR_PROMPT_INTELLIGENCE_INVALID"),
        apiKey: Yup.string().required("ERR_PROMPT_APIKEY_INVALID"),
        queueId: Yup.number().required("ERR_PROMPT_QUEUEID_INVALID"),
        maxMessages: Yup.number().required("ERR_PROMPT_MAX_MESSAGES_INVALID"),
        companyId: Yup.number().required("ERR_PROMPT_companyId_INVALID")
    });

    try {
        await promptSchema.validate({ name, apiKey, prompt, queueId, maxMessages, companyId });
    } catch (err: any) {
        // Serializar o erro do Yup inteiro devolvia o `value` validado ao
        // cliente — ou seja, a própria apiKey na mensagem de erro.
        throw new AppError(err.errors?.[0] || err.message || "ERR_PROMPT_INVALID", 400);
    }

    const encryptedApiKey = apiKey ? encrypt(apiKey) : "";

    // Só uma empresa pode ter um prompt padrão por vez.
    if (promptData.isDefault) {
        await Prompt.update(
            { isDefault: false },
            { where: { companyId } }
        );
    }

    let promptTable = await Prompt.create({
        ...promptData,
        companyId: Number(companyId),
        apiKey: encryptedApiKey,
        provider: promptData.provider || "openai",
        model: promptData.model || "gpt-4o-mini"
    });
    promptTable = await ShowPromptService({ promptId: promptTable.id, companyId });

    return promptTable;
};

export default CreatePromptService;
