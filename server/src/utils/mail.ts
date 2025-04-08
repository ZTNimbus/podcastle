import { generateTemplate } from "#/mail/template";
import emailVerificationToken from "#/models/emailVerificationToken";
import { MailtrapTransport } from "mailtrap";
import Nodemailer from "nodemailer";
import path from "path";
import { MAILTRAP_TOKEN } from "./variables";
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
  userId: string;
}

export async function sendVerificationMail(
  token: string,
  { name, email, userId }: Profile
) {
  const transport = await generateMailTransporter();

  const sender = {
    address: "kaya@kaya-atasoy.site",
    name: "Podcastle",
  };
  const recipients = [email];

  await emailVerificationToken.create({
    owner: userId,
    token,
  });

  const welcomeMessage = `Hi ${name}, welcome to Podcastle! The future of Podcasting is only one verification away. Please use the token below to verify your email.`;

  await transport
    .sendMail({
      from: sender,
      to: recipients,
      subject: "Your verification token | Podcastle",
      html: generateTemplate({
        token,
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
