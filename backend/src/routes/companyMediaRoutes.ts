import { Router } from "express";
import { serveCompanyMedia } from "../controllers/CompanyMediaController";

const companyMediaRoutes = Router();

// O conteúdo de cada empresa só é entregue com URL assinada e expira em 15 min.
companyMediaRoutes.get("/public/company:companyId/*", serveCompanyMedia);

export default companyMediaRoutes;
