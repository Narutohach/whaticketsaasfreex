import path from "path";
import { Request } from "express";
import { FileFilterCallback } from "multer";

/**
 * O multer exige um `Error` de verdade no callback, e o `AppError` do projeto
 * não estende `Error`. O `statusCode` é lido pelo handler de erro do app.ts
 * para responder 400 em vez de 500.
 */
export class UploadError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "UploadError";
    this.statusCode = statusCode;
  }
}

/**
 * Tudo que sobe por upload é servido estaticamente em /public (ver app.ts), por
 * isso a extensão é o que realmente importa: ela define como o arquivo será
 * entregue ao navegador. A lista abaixo cobre o que o produto realmente usa —
 * mídia de WhatsApp, importação de contatos e logotipos.
 */
const ALLOWED_EXTENSIONS = new Set([
  // imagens
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".ico",
  // áudio
  ".mp3",
  ".ogg",
  ".oga",
  ".opus",
  ".wav",
  ".m4a",
  ".aac",
  ".amr",
  // vídeo
  ".mp4",
  ".3gp",
  ".mov",
  ".webm",
  // documentos
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".zip",
  ".rar"
]);

const ALLOWED_MIME_PREFIXES = ["image/", "audio/", "video/"];

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
  "application/x-rar-compressed",
  "text/plain",
  "text/csv",
  // navegadores e a API externa mandam octet-stream com frequência; nesse caso
  // quem decide é a extensão, que já passou pela allowlist acima.
  "application/octet-stream"
]);

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

export const uploadLimits = {
  fileSize: MAX_UPLOAD_SIZE_BYTES,
  files: 10
};

export const uploadFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    cb(new UploadError("ERR_INVALID_FILE_EXTENSION", 400));
    return;
  }

  const mimeType = (file.mimetype || "").toLowerCase();
  const mimeAllowed =
    ALLOWED_MIME_TYPES.has(mimeType) ||
    ALLOWED_MIME_PREFIXES.some(prefix => mimeType.startsWith(prefix));

  if (!mimeAllowed) {
    cb(new UploadError("ERR_INVALID_FILE_TYPE", 400));
    return;
  }

  cb(null, true);
};

/**
 * `originalname` chega direto do cliente. `path.basename` descarta qualquer
 * componente de diretório (incluindo `..`) e a normalização remove o que
 * poderia atravessar pastas ou confundir o servidor estático.
 */
export const sanitizeUploadFileName = (originalName: string): string => {
  const base = path.basename(originalName || "arquivo").replace(/\\/g, "/");
  const safe = path
    .basename(base)
    .replace(/[^\w.\-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^\.+/, "");

  const extension = path.extname(safe).toLowerCase();
  const stem = path.basename(safe, path.extname(safe)).slice(0, 120);

  return `${stem || "arquivo"}${extension}`;
};

/**
 * Garante que o caminho final continua dentro de `baseFolder`. Sem isso um
 * segmento vindo da requisição (ex.: `typeArch=../../..`) escapa de /public,
 * porque `path.resolve` interpreta os `..`.
 */
export const resolveInsideFolder = (
  baseFolder: string,
  ...segments: string[]
): string => {
  const target = path.resolve(baseFolder, ...segments);
  const relative = path.relative(baseFolder, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new UploadError("ERR_INVALID_UPLOAD_PATH", 400);
  }

  return target;
};
