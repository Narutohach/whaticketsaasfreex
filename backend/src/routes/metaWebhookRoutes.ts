import { Router } from "express";
import * as MetaWebhookController from "../controllers/MetaWebhookController";

const metaWebhookRoutes = Router();

metaWebhookRoutes.get("/webhooks/meta/whatsapp", MetaWebhookController.verify);
metaWebhookRoutes.post("/webhooks/meta/whatsapp", MetaWebhookController.handle);

export default metaWebhookRoutes;
