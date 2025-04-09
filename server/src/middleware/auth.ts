import passwordResetToken from "#/models/passwordResetToken";
import { NextFunction, Request, Response } from "express";

export async function isValidPasswordResetToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token, userId } = req.body;

  const resetToken = await passwordResetToken.findOne({ owner: userId });

  if (!resetToken) return res.status(403).json({ error: "Invalid token" });

  const matched = await resetToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: "Invalid token" });

  next();
}
