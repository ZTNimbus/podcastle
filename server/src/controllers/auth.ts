import { CreateUserRequest, VerifyEmailRequest } from "#/@types/user";
import emailVerificationToken from "#/models/emailVerificationToken";
import PasswordResetToken from "#/models/passwordResetToken";
import User from "#/models/users";
import { formatProfile, generateToken } from "#/utils/helper";
import {
  sendForgotPasswordLink,
  sendPasswordResetSuccessEmail,
  sendVerificationMail,
} from "#/utils/mail";
import { PASSWORD_RESET_LINK } from "#/utils/variables";
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { RequestWithFiles } from "#/middleware/fileParser";
import cloudinary from "#/cloud";
import formidable from "formidable";

export async function signup(req: CreateUserRequest, res: Response) {
  const { email, password, name } = req.body;

  const user = await User.create({ email, password, name });

  const token = generateToken();

  await emailVerificationToken.create({
    owner: user._id,
    token,
  });

  sendVerificationMail(token, { name, email });

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

export async function sendVerificationToken(req: Request, res: Response) {
  const { userId } = req.body;

  if (!isValidObjectId(userId))
    return res.status(403).json({ error: "Invalid user id" });

  await emailVerificationToken.findOneAndDelete({
    owner: userId,
  });

  const newToken = generateToken();

  emailVerificationToken.create({
    owner: userId,
    token: newToken,
  });

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: "User not found" });

  sendVerificationMail(newToken, {
    name: user.name,
    email: user.email,
  });

  res.status(200).json({ message: "Verification token sent to email" });
}

export async function generateForgotPasswordLink(req: Request, res: Response) {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(403).json({ error: "User not found" });

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  const token = crypto.randomUUID();

  await PasswordResetToken.create({ owner: user._id, token });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgotPasswordLink({ email, link: resetLink });

  res.status(200).json({ message: "Password reset link sent to email" });
}

export async function grandValid(req: Request, res: Response) {
  res.status(200).json({ valid: true });
}

export async function resetPassword(req: Request, res: Response) {
  const { password, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: "User not found" });

  const isSamePassword = await user.comparePassword(password);
  if (isSamePassword)
    return res.status(422).json({ error: "New password must be different" });

  user.password = password;

  await user.save();

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  sendPasswordResetSuccessEmail(user.email);

  res.status(200).json({ message: "Password reset successfully" });
}

export async function signIn(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(403).json({ error: "Invalid Credentials" });

  const isSamePassword = await user.comparePassword(password);
  if (!isSamePassword)
    return res.status(403).json({ error: "Invalid Credentials" });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET as string
  );

  user.tokens.push(token);

  await user.save();

  res.status(200).json({
    user: formatProfile(user),
    token,
  });
}

export async function sendProfile(req: Request, res: Response) {
  res.status(200).json({ user: req.user });
}

export async function updateProfile(req: RequestWithFiles, res: Response) {
  const { name } = req.body;
  const avatar = req.files?.avatar as formidable.File;

  const user = await User.findById(req.user?.id);
  if (!user) throw new Error("Something went wrong, user not found");

  if (typeof name !== "string") res.status(422).json({ error: "Invalid name" });
  if (name.trim().length < 2 || name.trim().length > 50)
    res.status(422).json({ error: "Invalid name" });

  user.name = name;

  if (avatar) {
    if (user.avatar?.publicId)
      await cloudinary.uploader.destroy(user.avatar.publicId);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      avatar.filepath,
      {
        width: 300,
        height: 300,
        crop: "thumb",
        gravity: "face",
      }
    );

    user.avatar = { url: secure_url, publicId: public_id };
  }

  await user.save();

  res.status(200).json({
    user: formatProfile(user),
  });
}

export async function logout(req: Request, res: Response) {
  const { fromAll } = req.query;

  const token = req.token;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("Something went wrong, user not found");

  if (fromAll === "yes") user.tokens = [];
  else user.tokens = user.tokens.filter((t) => t !== token);

  await user.save();

  res.status(200).json({ message: "Logout successfully" });
}
