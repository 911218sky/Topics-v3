// npm
import nodemailer, {
  Transporter,
  SentMessageInfo,
  SendMailOptions,
} from "nodemailer";
import { config } from "dotenv";

config({ path: "../.env" });

namespace Email {
  function generateAlphanumeric(length: number): string {
    const characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  let transporter: Transporter | null = null;

  function getTransporter(): Transporter {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIN_EMAIL!,
          pass: process.env.MAIN_EMAIL_PASSWORD!,
        },
      });
    }
    return transporter;
  }

  export async function sendOTP(
    toEmail: string
  ): Promise<{ info: SentMessageInfo; code: string }> {
    const code = generateAlphanumeric(6);
    const mailOptions: SendMailOptions = {
      from: process.env.MAIN_EMAIL,
      to: toEmail,
      subject: "Verification code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Verification Code</h1>
          <p style="font-size: 16px;">Your verification code is: ${code}</p>
          <div style="border: 1px solid #ccc; border-radius: 5px; padding: 10px; font-size: 24px; text-align: center; margin: 20px 0;">${code}</div>
          <p style="font-size: 16px;">Enter this code on the verification page to confirm your email address.</p>
        </div>
      `,
    };
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(toEmail, code);
    return { info, code };
  }

  export async function sendResetPasswordEmail(
    toEmail: string,
    url: string
  ): Promise<SentMessageInfo> {
    const mailOptions: SendMailOptions = {
      from: process.env.MAIN_EMAIL,
      to: toEmail,
      subject: "Reset Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">Reset Password</h1>
          <p style="font-size: 16px;">You are receiving this email because we received a password reset request for your account.</p>
          <div style="border: 1px solid #ccc; border-radius: 5px; padding: 10px; font-size: 24px; text-align: center; margin: 20px 0;">
            <a href="${url}" target="_blank" rel="noopener noreferrer">Reset Password</a>
          </div>
          <p style="font-size: 16px;">If you did not request a password reset, no further action is required.</p>
        </div>
      `,
    };
    const transporter = getTransporter();
    return transporter.sendMail(mailOptions);
    // console.log(toEmail, url);
    // return Promise.resolve();
  }
}

export default Email;
