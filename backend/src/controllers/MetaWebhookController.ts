import { Request, Response } from "express";
import crypto from "crypto";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import { getIO } from "../libs/socket";

// Comparação em tempo constante. timingSafeEqual lança quando os buffers têm
// tamanhos diferentes, por isso o tamanho é checado antes.
const safeCompare = (a: string, b: string): boolean => {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};

const SIGNATURE_PREFIX = "sha256=";

// A Meta assina todo POST com HMAC-SHA256 do corpo bruto usando o app secret.
const isValidSignature = (req: Request): boolean => {
  const appSecret = process.env.META_APP_SECRET;

  // Instalações existentes não têm META_APP_SECRET definido. Recusar tudo
  // aqui derrubaria o webhook delas em produção, então a escolha é seguir
  // sem validar e registrar o aviso em vez de quebrar quem já está no ar.
  if (!appSecret) {
    logger.warn(
      "META_APP_SECRET não configurado: webhook da Meta sendo aceito SEM verificação de assinatura"
    );
    return true;
  }

  const header = req.headers["x-hub-signature-256"];
  const signature = Array.isArray(header) ? header[0] : header;

  if (!signature || !signature.startsWith(SIGNATURE_PREFIX)) {
    return false;
  }

  // Preenchido pelo callback `verify` do bodyParser em app.ts. O HMAC precisa
  // dos bytes originais: re-serializar o JSON já parseado invalida a assinatura.
  const rawBody = (req as any).rawBody as Buffer | undefined;

  if (!rawBody || rawBody.length === 0) {
    logger.error(
      "Corpo bruto indisponível: não é possível validar a assinatura do webhook da Meta"
    );
    return false;
  }

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  return safeCompare(expected, signature.slice(SIGNATURE_PREFIX.length));
};

export const verify = async (req: Request, res: Response): Promise<Response> => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Não existe coluna de verify token por conexão no modelo Whatsapp — a
  // versão anterior consultava a coluna `session` (credenciais do Baileys),
  // o que transformava o endpoint em oráculo de adivinhação. O token vem só
  // de variável de ambiente. META_WEBHOOK_VERIFY_TOKEN é mantido por
  // compatibilidade com instalações existentes.
  const expectedToken =
    process.env.META_VERIFY_TOKEN ||
    process.env.META_WEBHOOK_VERIFY_TOKEN ||
    "whaticket_meta_token";

  if (!process.env.META_VERIFY_TOKEN && !process.env.META_WEBHOOK_VERIFY_TOKEN) {
    logger.warn(
      "META_VERIFY_TOKEN não configurado: webhook da Meta usando o token padrão público"
    );
  }

  if (mode === "subscribe" && typeof token === "string" && safeCompare(token, expectedToken)) {
    return res.status(200).send(challenge);
  }

  return res.status(403).json({ error: "Verification failed" });
};

export const handle = async (req: Request, res: Response): Promise<Response> => {
  if (!isValidSignature(req)) {
    logger.warn("Webhook da Meta rejeitado: X-Hub-Signature-256 inválida ou ausente");
    return res.status(401).send("INVALID_SIGNATURE");
  }

  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value) {
        const phoneNumberId = value.metadata?.phone_number_id;
        const messages = value.messages;
        const statuses = value.statuses;

        logger.info(`Received Meta Cloud API webhook for phone_number_id: ${phoneNumberId}`);

        // Find associated whatsapp connection
        const whatsapp = await Whatsapp.findOne({
          where: { number: phoneNumberId }
        });

        if (whatsapp) {
          const io = getIO();
          // Emit or enqueue for message pipeline
          if (messages && messages.length > 0) {
            io.to(`company-${whatsapp.companyId}-mainchannel`).emit(`company-${whatsapp.companyId}-meta-message`, {
              whatsappId: whatsapp.id,
              messages
            });
          }
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (err: any) {
      logger.error(`Error processing Meta Webhook: ${err.message}`);
      return res.status(500).send("INTERNAL_ERROR");
    }
  }

  return res.sendStatus(404);
};
