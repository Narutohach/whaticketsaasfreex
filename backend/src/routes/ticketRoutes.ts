import express from "express";
import isAuth from "../middleware/isAuth";
import isActiveCompany from "../middleware/isActiveCompany";

import * as TicketController from "../controllers/TicketController";

const ticketRoutes = express.Router();

// Leitura fica liberada mesmo para empresa suspensa: o objetivo é impedir que
// ela continue operando, não esconder os dados dela (ver isActiveCompany).
ticketRoutes.get("/tickets", isAuth, TicketController.index);

ticketRoutes.get("/ticket/reports", isAuth, TicketController.report);

ticketRoutes.get("/tickets/:ticketId", isAuth, TicketController.show);

ticketRoutes.get("/ticket/kanban", isAuth, TicketController.kanban);

ticketRoutes.get("/tickets/u/:uuid", isAuth, TicketController.showFromUUID);

ticketRoutes.post("/tickets", isAuth, isActiveCompany, TicketController.store);

ticketRoutes.put(
  "/tickets/:ticketId",
  isAuth,
  isActiveCompany,
  TicketController.update
);

ticketRoutes.delete(
  "/tickets/:ticketId",
  isAuth,
  isActiveCompany,
  TicketController.remove
);

ticketRoutes.post(
  "/tickets/closeAll",
  isAuth,
  isActiveCompany,
  TicketController.closeAll
);

export default ticketRoutes;
