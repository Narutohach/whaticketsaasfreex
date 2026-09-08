import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";
import envTokenAuth from "../middleware/envTokenAuth";
import { createRateLimiter } from "../middleware/rateLimiter";

const authRoutes = Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 tentativas por IP
  message: "ERR_TOO_MANY_LOGIN_ATTEMPTS"
});

const signupLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: "ERR_TOO_MANY_SIGNUP_ATTEMPTS"
});

const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

authRoutes.post("/signup", signupLimiter, envTokenAuth, UserController.store);
authRoutes.post("/login", loginLimiter, SessionController.store);
authRoutes.post("/refresh_token", refreshLimiter, SessionController.update);
authRoutes.delete("/logout", isAuth, SessionController.remove);
authRoutes.get("/me", isAuth, SessionController.me);

export default authRoutes;
