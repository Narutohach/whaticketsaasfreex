import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import User from "../models/User";

/**
 * Ações administrativas da própria empresa; super admins também são aceitos.
 *
 * Relê `profile`/`super` do banco em vez de confiar nas claims do JWT, pelo
 * mesmo motivo de isSuper.ts: o access token vive até 15 minutos
 * (config/auth.ts), então confiar cegamente nele deixaria um admin rebaixado
 * a "user" em runtime continuar passando por rotas administrativas
 * (filas, WhatsApp, prompts, integrações, arquivos) até o token expirar.
 */
const isAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await User.findByPk(req.user?.id, {
    attributes: ["profile", "super"]
  });

  if (!user || (user.profile !== "admin" && !user.super)) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  next();
};

export default isAdmin;
