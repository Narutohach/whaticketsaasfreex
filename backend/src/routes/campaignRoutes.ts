import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import isActiveCompany from "../middleware/isActiveCompany";

import * as CampaignController from "../controllers/CampaignController";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

routes.get("/campaigns/list", isAuth, CampaignController.findList);

routes.get("/campaigns", isAuth, CampaignController.index);

routes.get("/campaigns/:id", isAuth, CampaignController.show);

routes.post("/campaigns", isAuth, isActiveCompany, CampaignController.store);

routes.put(
  "/campaigns/:id",
  isAuth,
  isActiveCompany,
  CampaignController.update
);

routes.delete("/campaigns/:id", isAuth, CampaignController.remove);

routes.post(
  "/campaigns/:id/cancel",
  isAuth,
  isActiveCompany,
  CampaignController.cancel
);

routes.post(
  "/campaigns/:id/restart",
  isAuth,
  isActiveCompany,
  CampaignController.restart
);

routes.post(
  "/campaigns/:id/media-upload",
  isAuth,
  upload.array("file"),
  CampaignController.mediaUpload
);

routes.delete(
  "/campaigns/:id/media-upload",
  isAuth,
  CampaignController.deleteMedia
);

export default routes;
