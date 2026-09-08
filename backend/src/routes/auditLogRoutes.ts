import express from "express";
import isAuth from "../middleware/isAuth";
import * as AuditLogController from "../controllers/AuditLogController";

const auditLogRoutes = express.Router();

// A permissão (admin da própria empresa ou super admin para ?companyId=)
// é validada no controller.
auditLogRoutes.get("/audit-logs", isAuth, AuditLogController.index);

export default auditLogRoutes;
