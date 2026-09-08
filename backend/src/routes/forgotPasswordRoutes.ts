import express from "express";
import isAuth from "../middleware/isAuth";
import * as ForgotController from "../controllers/ForgotController";
import { createRateLimiter } from "../middleware/rateLimiter";
const forgotsRoutes = express.Router();

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: "ERR_TOO_MANY_FORGOT_PASSWORD_ATTEMPTS",
  keyPrefix: "forgetpassword"
});

// O token de reset viaja na própria URL, então sem limite ele é
// enumerável por força bruta. Limite estrito por IP e com keyPrefix fixo,
// senão cada token tentado geraria um bucket diferente.
const resetPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: "ERR_TOO_MANY_RESET_PASSWORD_ATTEMPTS",
  keyPrefix: "resetpasswords"
});

forgotsRoutes.post(
  "/forgetpassword/:email",
  forgotPasswordLimiter,
  ForgotController.store
);
forgotsRoutes.post(
  "/resetpasswords/:email/:token/:password",
  resetPasswordLimiter,
  ForgotController.resetPasswords
);
export default forgotsRoutes;
