import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";

import * as SubscriptionController from "../controllers/SubscriptionController";
import { createRateLimiter } from "../middleware/rateLimiter";

const subscriptionRoutes = express.Router();

// Callback do provedor de pagamento: sem autenticação, então precisa de
// limite, mas folgado o suficiente para não descartar notificações legítimas
// em rajada (o provedor reenvia, mas atrasa a confirmação).
const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 120,
  message: "ERR_TOO_MANY_REQUESTS",
  keyPrefix: "subscription_webhook"
});

subscriptionRoutes.post("/subscription", isAuth, SubscriptionController.createSubscription);
subscriptionRoutes.post("/subscription/create/webhook", isAuth, isSuper, webhookLimiter, SubscriptionController.createWebhook);
subscriptionRoutes.post("/subscription/webhook/:type?", webhookLimiter, SubscriptionController.webhook);

export default subscriptionRoutes;
