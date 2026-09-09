import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import isActiveCompany from "../middleware/isActiveCompany";

import * as ScheduleController from "../controllers/ScheduleController";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const scheduleRoutes = express.Router();

scheduleRoutes.get("/schedules", isAuth, ScheduleController.index);

scheduleRoutes.post(
  "/schedules",
  isAuth,
  isActiveCompany,
  ScheduleController.store
);

scheduleRoutes.put(
  "/schedules/:scheduleId",
  isAuth,
  isActiveCompany,
  ScheduleController.update
);

scheduleRoutes.get("/schedules/:scheduleId", isAuth, ScheduleController.show);

scheduleRoutes.delete(
  "/schedules/:scheduleId",
  isAuth,
  ScheduleController.remove
);

scheduleRoutes.post(
  "/schedules/:id/media-upload",
  isAuth,
  upload.array("file"),
  ScheduleController.mediaUpload
);

scheduleRoutes.delete(
  "/schedules/:id/media-upload",
  isAuth,
  ScheduleController.deleteMedia
);

export default scheduleRoutes;
