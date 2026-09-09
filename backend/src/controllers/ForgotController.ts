import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import SendMail from "../services/ForgotPassWordServices/SendMail";
import ResetPassword from "../services/ResetPasswordService/ResetPassword";

type ResetPasswordPayload = { email?: string; token?: string; password?: string };
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body as ResetPasswordPayload;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "E-mail inválido" });
  }

  const TokenSenha = uuid();
  await SendMail(email, TokenSenha);

  // Resposta uniforme evita enumerar contas cadastradas.
  return res.status(200).json({ message: "Se o e-mail existir, enviaremos as instruções." });
};
export const resetPasswords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, token, password } = req.body as ResetPasswordPayload;
  if (!email || !token || !password || typeof email !== "string" || typeof token !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Dados de redefinição inválidos" });
  }

  const resetPassword = await ResetPassword(email, token, password);
  if (resetPassword) {
    return res.status(200).json({ message: "Senha redefinida com sucesso" });
  }
  return res.status(400).json({ error: "Dados de redefinição inválidos" });
};
