import path from "path";
import { Request, Response } from "express";
import uploadConfig from "../config/upload";
import { hasValidCompanyMediaSignature } from "../helpers/SignedCompanyMedia";

export const serveCompanyMedia = (req: Request, res: Response): void => {
  const companyId = Number(req.params.companyId);
  const mediaPath = req.params[0];
  const { expires, signature } = req.query;

  if (!hasValidCompanyMediaSignature(companyId, mediaPath, expires, signature)) {
    res.status(403).end();
    return;
  }

  const companyDirectory = path.resolve(uploadConfig.directory, `company${companyId}`);
  const filePath = path.resolve(companyDirectory, mediaPath);
  if (!filePath.startsWith(`${companyDirectory}${path.sep}`)) {
    res.status(403).end();
    return;
  }

  res.sendFile(filePath, error => {
    if (error && !res.headersSent) {
      res.status((error as any).statusCode === 404 ? 404 : 500).end();
    }
  });
};
