import path from "path";
import multer from "multer";
import {
  UploadError,
  uploadFileFilter,
  uploadLimits
} from "../helpers/UploadSecurity";

const publicFolder = path.resolve(__dirname, "..", "..", "public/logotipos");

/**
 * O nome do arquivo vinha inteiro de `req.query.ref`, o que permitia
 * `?ref=../../server` e escrita fora da pasta. Agora só os destinos conhecidos
 * da tela de personalização são aceitos.
 */
const ALLOWED_REFS = [
  "signup",
  "login",
  "interno",
  "logo_w",
  "favicon",
  "favicon-256x256",
  "apple-touch-icon"
];

const ALLOWED_LOGO_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".ico"];

export default {
  directory: publicFolder,
  limits: uploadLimits,
  fileFilter: uploadFileFilter,
  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {
      const ref = `${req.query.ref || ""}`;

      if (!ALLOWED_REFS.includes(ref)) {
        return cb(new UploadError("ERR_INVALID_LOGO_REF", 400), "");
      }

      const extension = path.extname(file.originalname || "").toLowerCase();

      if (!ALLOWED_LOGO_EXTENSIONS.includes(extension)) {
        return cb(new UploadError("ERR_INVALID_FILE_EXTENSION", 400), "");
      }

      return cb(null, `${ref}${extension}`);
    }
  })
};
