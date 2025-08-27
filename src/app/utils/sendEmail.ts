/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

// Dynamically set secure based on port
const isSecure = Number(envVars.EMAIL_SENDER.SMTP_PORT) === 465;

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST, // e.g. smtp.gmail.com
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT), // 587 or 465
  secure: isSecure, // true if 465 (SSL), false if 587 (STARTTLS)
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({ to, subject, templateName, templateData, attachments }: SendEmailOptions) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments,
    });

    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.error("Email sending error:", error);
    throw new AppError(401, "Email error");
  }
};
