import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import isActiveCompany from "../middleware/isActiveCompany";

import WhatsAppSessionController from "../controllers/WhatsAppSessionController";

const whatsappSessionRoutes = Router();

// Conectar/reconectar exige empresa ativa: o cron de faturamento derruba as
// sessões da empresa suspensa, mas sem esta checagem bastava escanear um QR
// code novo para continuar operando sem pagar. Desconectar (delete) segue
// liberado — não faz sentido impedir alguém de encerrar a própria sessão.
whatsappSessionRoutes.post(
  "/whatsappsession/:whatsappId",
  isAuth,
  isAdmin,
  isActiveCompany,
  WhatsAppSessionController.store
);

whatsappSessionRoutes.put(
  "/whatsappsession/:whatsappId",
  isAuth,
  isAdmin,
  isActiveCompany,
  WhatsAppSessionController.update
);

whatsappSessionRoutes.delete(
  "/whatsappsession/:whatsappId",
  isAuth,
  isAdmin,
  WhatsAppSessionController.remove
);

export default whatsappSessionRoutes;
