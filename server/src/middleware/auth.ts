import passwordResetToken from "#/models/passwordResetToken";
import User from "#/models/users";
import { formatProfile } from "#/utils/helper";
import { JWT_SECRET } from "#/utils/variables";
import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

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

export async function isAuth(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  const token = authorization?.split("Bearer ")[1];
  if (!token) return res.status(403).json({ error: "Unauthorized" });

  const payload = verify(token, JWT_SECRET) as JwtPayload;
  const id = payload.id;

  const user = await User.findOne({ _id: id, tokens: token });
  if (!user) return res.status(403).json({ error: "Unauthorized" });

  req.user = formatProfile(user);

  req.token = token;

  next();
}

export async function isVerified(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user.verified)
    return res.status(403).json({ error: "User not verified" });

  next();
}

//Does not throw error like isAuth middleware
//Register user and token is token exists, no action if no token, finally next() regardless of token
export async function isAuthSoft(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  const token = authorization?.split("Bearer ")[1];

  if (token) {
    const payload = verify(token, JWT_SECRET) as JwtPayload;
    const id = payload.id;

    const user = await User.findOne({ _id: id, tokens: token });
    if (!user) return res.status(403).json({ error: "Unauthorized" });

    req.user = formatProfile(user);

    req.token = token;
  }

  next();
}
