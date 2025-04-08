import { CreateUserRequest, VerifyEmailRequest } from "#/@types/user";
import emailVerificationToken from "#/models/emailVerificationToken";
import User from "#/models/users";
import { generateToken } from "#/utils/helper";
import { sendVerificationMail } from "#/utils/mail";
import { Response } from "express";

export async function signup(req: CreateUserRequest, res: Response) {
  const { email, password, name } = req.body;

  const user = await User.create({ email, password, name });

  const token = generateToken();

  sendVerificationMail(token, { name, email, userId: user._id.toString() });

  res.status(201).json({ user: { id: user._id, name, email } });
}

export async function verifyEmail(req: VerifyEmailRequest, res: Response) {
  const { token, userId } = req.body;

  const verificationToken = await emailVerificationToken.findOne({
    owner: userId,
  });

  if (!verificationToken)
    return res.status(403).json({ error: "Invalid token" });

  const matched = await verificationToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: "Invalid token" });

  await User.findByIdAndUpdate(userId, { verified: true });

  await emailVerificationToken.findByIdAndDelete(verificationToken._id);

  res.status(200).json({ message: "Email verified" });
}
