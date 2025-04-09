import passwordResetToken from "#/models/passwordResetToken";
import User from "#/models/users";
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

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };

  next();
}
