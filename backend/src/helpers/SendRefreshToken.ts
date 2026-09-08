import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, {
    httpOnly: true,
    // "secure" requires HTTPS, which local dev (http://localhost) doesn't have.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
};
