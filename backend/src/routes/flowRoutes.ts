import { Router } from "express";
import * as FlowController from "../controllers/FlowController";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";

const flowRoutes = Router();

flowRoutes.get("/flows", isAuth, FlowController.index);
flowRoutes.post("/flows", isAuth, isAdmin, FlowController.store);
flowRoutes.get("/flows/:flowId", isAuth, FlowController.show);
flowRoutes.put("/flows/:flowId", isAuth, isAdmin, FlowController.update);
flowRoutes.delete("/flows/:flowId", isAuth, isAdmin, FlowController.remove);

export default flowRoutes;
