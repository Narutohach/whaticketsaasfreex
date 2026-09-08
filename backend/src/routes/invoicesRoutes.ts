import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as QueueOptionController from "../controllers/QueueOptionController";
import * as InvoicesController from "../controllers/InvoicesController"

const invoiceRoutes = express.Router();

invoiceRoutes.get("/invoices", isAuth, InvoicesController.index);
invoiceRoutes.get("/invoices/list", isAuth, InvoicesController.list);
invoiceRoutes.get("/invoices/all", isAuth, InvoicesController.list);
invoiceRoutes.get("/invoices/:Invoiceid", isAuth, InvoicesController.show);
// Marcar fatura como paga é ação do dono da plataforma; o pagamento do cliente
// entra pelo webhook da assinatura.
invoiceRoutes.put("/invoices/:id", isAuth, isSuper, InvoicesController.update);

export default invoiceRoutes;
