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

export default {
  directory: publicFolder,
  limits: uploadLimits,
  fileFilter: uploadFileFilter,
  storage: multer.diskStorage({
    async destination(req, file, cb) {
      try {
        let companyId = req.user?.companyId;

        if (!companyId) {
          // Fluxo da API externa: a identidade vem do token da conexão.
          const authHeader = req.headers?.authorization;

          if (!authHeader) {
            throw new UploadError("ERR_NO_PERMISSION", 401);
          }

          const [, token] = authHeader.split(" ");
          const whatsapp = token
            ? await Whatsapp.findOne({ where: { token } })
            : null;

          if (!whatsapp) {
            throw new UploadError("ERR_NO_PERMISSION", 401);
          }

          companyId = whatsapp.companyId;
        }

        const folder = resolveInsideFolder(
          publicFolder,
          `company${companyId}`,
          "quick"
        );

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
      const fileName = `${new Date().getTime()}_${sanitizeUploadFileName(
        file.originalname
      )}`;
      return cb(null, fileName);
    }
  })
};
