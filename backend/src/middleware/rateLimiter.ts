import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  // Identificador fixo do bucket. Necessário em rotas com parâmetros na URL
  // (ex.: /resetpasswords/:email/:token/:password): sem isso a chave usa o
  // req.path já substituído e cada tentativa de força bruta cairia em um
  // bucket novo, anulando o limite.
  keyPrefix?: string;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Limpeza automática periódica a cada 1 minuto
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 60000);

export const createRateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, message = "ERR_TOO_MANY_REQUESTS", keyPrefix } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const scope = keyPrefix || `${req.baseUrl || ""}${req.path}`;
    const key = `${scope}_${ip}`;
    const now = Date.now();

    const record = memoryStore.get(key);

    if (!record || now > record.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      throw new AppError(message, 429);
    }

    record.count += 1;
    return next();
  };
};
