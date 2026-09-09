import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

/** Ações administrativas da própria empresa; super admins também são aceitos. */
const isAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.profile !== "admin" && !req.user?.super) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  next();
};

export default isAdmin;
