import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

import AppError from "../errors/AppError";

type TokenPayload = {
  token: string | undefined;
};

const tokensMatch = (provided: string, expected: string): boolean => {
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

const envTokenAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { token: bodyToken } = req.body as TokenPayload;
    const { token: queryToken } = req.query as TokenPayload;
    const expectedToken = process.env.ENV_TOKEN;

    // Sem token configurado, o cadastro público deve permanecer fechado.
    if (!expectedToken) {
      throw new AppError("Cadastro público não configurado", 503);
    }

    if (typeof queryToken === "string" && tokensMatch(queryToken, expectedToken)) {
      return next();
    }

    if (typeof bodyToken === "string" && tokensMatch(bodyToken, expectedToken)) {
      return next();
    }
  } catch (e) {
    console.log(e);
  }

  throw new AppError("Token inválido", 403);
};

export default envTokenAuth;
