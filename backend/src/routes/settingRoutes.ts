import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SettingController from "../controllers/SettingController";
import multer from "multer";
import uploadConfig from "../config/uploadlogo";
import { createRateLimiter } from "../middleware/rateLimiter";
const upload = multer(uploadConfig);

const settingRoutes = Router();

const publicSettingsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 120
});

settingRoutes.get("/settings", isAuth, SettingController.index);

// Somente as chaves liberadas em helpers/PublicSettings — usadas pelas telas de
// login e cadastro, que rodam sem token.
settingRoutes.get(
  "/settings/public/:settingKey",
  publicSettingsLimiter,
  SettingController.publicShow
);

settingRoutes.get("/settings/:settingKey", isAuth, SettingController.show);

settingRoutes.put("/settings/:settingKey", isAuth, SettingController.update);

settingRoutes.post(
  "/settings/media-upload",
  isAuth,
  upload.array("file"),
  SettingController.mediaUpload
);

export default settingRoutes;
