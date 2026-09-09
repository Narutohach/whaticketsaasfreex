import crypto from "crypto";
import authConfig from "../config/auth";

const TTL_MS = 15 * 60 * 1000;

const normalizeMediaPath = (mediaPath: string): string | null => {
  const normalized = mediaPath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.split("/").some(part => !part || part === "." || part === "..")) {
    return null;
  }
  return normalized;
};

const signatureFor = (companyId: number, mediaPath: string, expires: number): string =>
  crypto
    .createHmac("sha256", `${authConfig.secret}:company-media`)
    .update(`${companyId}:${mediaPath}:${expires}`)
    .digest("hex");

export const createSignedCompanyMediaUrl = (
  companyId: number,
  mediaPath: string
): string | null => {
  const normalizedPath = normalizeMediaPath(mediaPath);
  if (!Number.isSafeInteger(companyId) || companyId <= 0 || !normalizedPath) return null;

  const expires = Date.now() + TTL_MS;
  const signature = signatureFor(companyId, normalizedPath, expires);
  const encodedPath = normalizedPath.split("/").map(encodeURIComponent).join("/");
  const baseUrl = `${process.env.BACKEND_URL || "http://localhost:8080"}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""}`;

  return `${baseUrl}/public/company${companyId}/${encodedPath}?expires=${expires}&signature=${signature}`;
};

export const hasValidCompanyMediaSignature = (
  companyId: number,
  mediaPath: string,
  expires: unknown,
  signature: unknown
): boolean => {
  const normalizedPath = normalizeMediaPath(mediaPath);
  const expiration = Number(expires);
  if (!normalizedPath || !Number.isSafeInteger(companyId) || companyId <= 0 || !Number.isSafeInteger(expiration) || expiration < Date.now() || typeof signature !== "string") {
    return false;
  }

  const expected = signatureFor(companyId, normalizedPath, expiration);
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
};
