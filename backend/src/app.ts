import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import helmet from "helmet";
import "reflect-metadata";
import "./bootstrap";

import bodyParser from 'body-parser';
import multer from "multer";
import uploadConfig from "./config/upload";
import "./database";
import AppError from "./errors/AppError";
import { UploadError } from "./helpers/UploadSecurity";
import { messageQueue, sendScheduledMessages } from "./queues";
import routes from "./routes";
import companyMediaRoutes from "./routes/companyMediaRoutes";
import { logger } from "./utils/logger";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

// Trust the first hop (the reverse proxy terminating TLS, e.g. Caddy/nginx)
// so req.secure / X-Forwarded-Proto and secure cookies work correctly.
app.set("trust proxy", 1);

app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

// CSP is left off: this is an API server, not the one rendering the
// frontend's HTML, and a default CSP can break the static /public assets
// (WhatsApp media, email attachments) served below.
app.use(helmet({ contentSecurityPolicy: false }));

const bodyparser = require('body-parser');
app.use(
  bodyParser.json({
    limit: '10mb',
    // Guarda o corpo bruto para validação de assinatura HMAC (webhook da Meta:
    // X-Hub-Signature-256). O hash tem que ser calculado sobre os bytes
    // originais — re-serializar o JSON parseado muda a ordem/espaçamento e
    // invalida a assinatura.
    verify: (req: Request, _res: Response, buf: Buffer) => {
      (req as any).rawBody = buf;
    }
  })
);

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use(companyMediaRoutes);
app.use("/public", express.static(uploadConfig.directory));
app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err.message);
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Rejeição de upload (extensão/MIME/caminho inválido) e os erros do próprio
  // multer são culpa da requisição, não falha do servidor.
  if (err instanceof UploadError) {
    logger.warn(err.message);
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof multer.MulterError) {
    logger.warn(`Upload rejeitado: ${err.code}`);
    return res.status(400).json({ error: `ERR_UPLOAD_${err.code}` });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
