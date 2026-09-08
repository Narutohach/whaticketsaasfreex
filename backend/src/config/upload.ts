import path from "path";
import multer from "multer";
import fs from "fs";
import Whatsapp from "../models/Whatsapp";
import {
  UploadError,
  resolveInsideFolder,
  sanitizeUploadFileName,
  uploadFileFilter,
  uploadLimits
} from "../helpers/UploadSecurity";

const publicFolder = path.resolve(__dirname, "..", "..", "public");

/**
 * `typeArch` e `fileId` chegam como campos de texto do multipart, ou seja, são
 * controlados pelo cliente. Antes eram concatenados direto no caminho de
 * destino, e como `path.resolve` interpreta `..`, um `typeArch=../../..`
 * escrevia arquivo em qualquer lugar do disco.
 */
const ALLOWED_TYPE_ARCH = ["announcements", "fileList", "quickMessage", "logo"];

const resolveCompanyId = async (req: any): Promise<number> => {
  if (req.user?.companyId) {
    return req.user.companyId;
  }

  // Fluxo da API externa: a identidade vem do token da conexão.
  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    throw new UploadError("ERR_NO_PERMISSION", 401);
  }

  const [, token] = authHeader.split(" ");
  const whatsapp = token ? await Whatsapp.findOne({ where: { token } }) : null;

  if (!whatsapp) {
    throw new UploadError("ERR_NO_PERMISSION", 401);
  }

  return whatsapp.companyId;
};

export default {
  directory: publicFolder,
  limits: uploadLimits,
  fileFilter: uploadFileFilter,
  storage: multer.diskStorage({
    async destination(req, file, cb) {
      try {
        const companyId = await resolveCompanyId(req);
        const { typeArch, fileId } = req.body;

        if (typeArch && !ALLOWED_TYPE_ARCH.includes(typeArch)) {
          return cb(new UploadError("ERR_INVALID_UPLOAD_TYPE", 400), "");
        }

        if (fileId && !/^\d+$/.test(`${fileId}`)) {
          return cb(new UploadError("ERR_INVALID_UPLOAD_PATH", 400), "");
        }

        let folder: string;

        if (typeArch && typeArch !== "announcements" && typeArch !== "logo") {
          folder = resolveInsideFolder(
            publicFolder,
            `company${companyId}`,
            typeArch,
            fileId ? `${fileId}` : ""
          );
        } else if (typeArch === "announcements") {
          folder = resolveInsideFolder(publicFolder, typeArch);
        } else if (typeArch === "logo") {
          folder = publicFolder;
        } else {
          folder = resolveInsideFolder(publicFolder, `company${companyId}`);
        }

        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
          fs.chmodSync(folder, 0o755);
        }

        return cb(null, folder);
      } catch (err: any) {
        return cb(err, "");
      }
    },
    filename(req, file, cb) {
      const { typeArch } = req.body;
      const safeName = sanitizeUploadFileName(file.originalname);

      // Mantém a regra original de nomeação (quem tem `typeArch` guarda o nome
      // estável, o resto recebe prefixo de timestamp) — o nome persistido no
      // banco é sempre o `file.filename` já sanitizado.
      const fileName =
        typeArch && typeArch !== "announcements"
          ? safeName
          : `${new Date().getTime()}_${safeName}`;

      return cb(null, fileName);
    }
  })
};
