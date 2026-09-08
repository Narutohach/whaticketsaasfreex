import { Router } from "express";
import * as MetaWebhookController from "../controllers/MetaWebhookController";
import { createRateLimiter } from "../middleware/rateLimiter";

const metaWebhookRoutes = Router();

// A Meta entrega eventos em rajada (várias mensagens no mesmo segundo),
// por isso o teto é alto: serve só para conter flood, não para modelar
// o tráfego normal.
const metaWebhookLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 300,
  message: "ERR_TOO_MANY_REQUESTS",
  keyPrefix: "meta_webhook"
});

metaWebhookRoutes.get("/webhooks/meta/whatsapp", metaWebhookLimiter, MetaWebhookController.verify);
metaWebhookRoutes.post("/webhooks/meta/whatsapp", metaWebhookLimiter, MetaWebhookController.handle);

export default metaWebhookRoutes;
