import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";

import * as CompanyController from "../controllers/CompanyController";
import { createRateLimiter } from "../middleware/rateLimiter";

const companyRoutes = express.Router();

// Cadastro público: sem limite era possível criar tenants em massa.
const publicSignupLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "ERR_TOO_MANY_SIGNUP_ATTEMPTS"
});

companyRoutes.get("/companies/list", isAuth, isSuper, CompanyController.list);
companyRoutes.get("/companies", isAuth, isSuper, CompanyController.index);
companyRoutes.get("/companies/:id", isAuth, CompanyController.show);
companyRoutes.post("/companies", isAuth, isSuper, CompanyController.store);
companyRoutes.put("/companies/:id", isAuth, isSuper, CompanyController.update);
companyRoutes.put("/companies/:id/schedules",isAuth,CompanyController.updateSchedules);
companyRoutes.delete("/companies/:id", isAuth, isSuper, CompanyController.remove);
companyRoutes.post(
  "/companies/cadastro",
  publicSignupLimiter,
  CompanyController.publicStore
);

// Rota para listar o plano da empresa
companyRoutes.get("/companies/listPlan/:id", isAuth, CompanyController.listPlan);
companyRoutes.get("/companiesPlan", isAuth, CompanyController.indexPlan);

export default companyRoutes;
