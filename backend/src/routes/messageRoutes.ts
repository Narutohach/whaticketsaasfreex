import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import isActiveCompany from "../middleware/isActiveCompany";
import uploadConfig from "../config/upload";
import tokenAuth from "../middleware/tokenAuth";

import * as MessageController from "../controllers/MessageController";
import { createRateLimiter } from "../middleware/rateLimiter";

const messageRoutes = Router();

const upload = multer(uploadConfig);

// API externa: envio de mensagens sem interação humana. Limite mais apertado
// porque cada requisição dispara um envio real no WhatsApp (custo e risco de ban).
const apiSendLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,
  message: "ERR_TOO_MANY_MESSAGE_REQUESTS"
});

// Rotas usadas pelo atendente na interface: limite generoso para não
// atrapalhar quem digita rápido, mas ainda barra automação abusiva.
// keyPrefix compartilhado porque as rotas têm :ticketId/:messageId na URL e
// sem ele cada ticket/mensagem teria um bucket próprio.
const agentMessageLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 120,
  message: "ERR_TOO_MANY_MESSAGE_REQUESTS",
  keyPrefix: "messages_write"
});

messageRoutes.get("/messages/:ticketId", isAuth, MessageController.index);
messageRoutes.post(
  "/messages/:ticketId",
  isAuth,
  isActiveCompany,
  agentMessageLimiter,
  upload.array("medias"),
  MessageController.store
);
messageRoutes.delete(
  "/messages/:messageId",
  isAuth,
  isActiveCompany,
  MessageController.remove
);
messageRoutes.post(
  "/api/messages/send",
  tokenAuth,
  apiSendLimiter,
  upload.array("medias"),
  MessageController.send
);
messageRoutes.post(
  "/messages/edit/:messageId",
  isAuth,
  isActiveCompany,
  agentMessageLimiter,
  MessageController.edit
);
messageRoutes.post(
  "/message/forward",
  isAuth,
  isActiveCompany,
  agentMessageLimiter,
  MessageController.forwardMessage
);
messageRoutes.post(
  "/messages/:messageId/reactions",
  isAuth,
  isActiveCompany,
  agentMessageLimiter,
  MessageController.addReaction
);

export default messageRoutes;
