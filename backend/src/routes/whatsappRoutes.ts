import express from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";

import * as WhatsAppController from "../controllers/WhatsAppController";

const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);

whatsappRoutes.post("/whatsapp/", isAuth, isAdmin, WhatsAppController.store);

whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);

whatsappRoutes.get(
  "/whatsapp/:whatsappId/templates",
  isAuth,
  WhatsAppController.listTemplates
);

whatsappRoutes.get(
  "/whatsapp/:whatsappId/status",
  isAuth,
  WhatsAppController.checkStatus
);

whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, isAdmin, WhatsAppController.update);

whatsappRoutes.post("/whatsapp-restart/", isAuth, isAdmin, WhatsAppController.restart);

whatsappRoutes.delete(
  "/whatsapp/:whatsappId",
  isAuth,
  isAdmin,
  WhatsAppController.remove
);

export default whatsappRoutes;
