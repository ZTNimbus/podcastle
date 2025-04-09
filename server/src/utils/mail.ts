import { generateTemplate } from "#/mail/template";
import { MailtrapTransport } from "mailtrap";
import Nodemailer from "nodemailer";
import path from "path";
import { MAILTRAP_TOKEN, SIGN_IN_URL } from "./variables";
export async function generateMailTransporter() {
  return Nodemailer.createTransport(
    MailtrapTransport({
      token: MAILTRAP_TOKEN,
    })
  );
}

interface Profile {
  name: string;
  email: string;
}

export async function sendVerificationMail(
  token: string,
  { name, email }: Profile
) {
  const transport = await generateMailTransporter();

  const sender = {
    address: "kaya@kaya-atasoy.site",
    name: "Podcastle",
  };
  const recipients = [email];

  const welcomeMessage = `Hi ${name}, welcome to Podcastle! The future of Podcasting is only one verification away. Please use the token below to verify your email.`;

  await transport
    .sendMail({
      from: sender,
      to: recipients,
      subject: "Your verification token | Podcastle",
      html: generateTemplate({
        btnMessage: token,
        message: welcomeMessage,
        logo: "cid:logo",
        headline: "Looking for a token?",
        link: "#",
      }),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../mail/logo.png"),
          cid: "logo",
        },
      ],
      category: "Verification Token",
    })
    .then(console.log, console.error);
}

interface Options {
  email: string;
  link: string;
}

export async function sendForgotPasswordLink({ email, link }: Options) {
  const transport = await generateMailTransporter();

  const sender = {
    address: "kaya@kaya-atasoy.site",
    name: "Podcastle",
  };
  const recipients = [email];

  const message = `Hi, we received a request to reset your password. Please click on the link below to reset your password. If you did not make this request, please ignore this email.`;

  await transport
    .sendMail({
      from: sender,
      to: recipients,
      subject: "Password Reset | Podcastle",
      html: generateTemplate({
        message: message,
        logo: "cid:logo",
        btnMessage: "Reset Password",
        headline: "Forgot Password?",
        link,
      }),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../mail/logo.png"),
          cid: "logo",
        },
      ],
      category: "Password Reset Link",
    })
    .then(console.log, console.error);
}

export async function sendPasswordResetSuccessEmail(email: string) {
  const transport = await generateMailTransporter();

  const sender = {
    address: "kaya@kaya-atasoy.site",
    name: "Podcastle",
  };
  const recipients = [email];

  const message = `Congrats! You have successfully reset your password. If you did not make this request, please contact us.`;

  await transport
    .sendMail({
      from: sender,
      to: recipients,
      subject: "Password Reset Success | Podcastle",
      html: generateTemplate({
        message: message,
        logo: "cid:logo",
        btnMessage: "Back To Podcastle",
        headline: "New Password!",
        link: SIGN_IN_URL,
      }),
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../mail/logo.png"),
          cid: "logo",
        },
      ],
      category: "Password Reset Success",
    })
    .then(console.log, console.error);
}
