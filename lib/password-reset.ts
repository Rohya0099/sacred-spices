import { createHash, randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";
import { passwordResetEmailTemplate } from "@/lib/email-templates";

export const PASSWORD_RESET_MINUTES = 45;

export function createPasswordResetToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const template = passwordResetEmailTemplate({ resetUrl });
  const result = await sendEmail({ to: email, templateName: "password-reset", ...template });
  return process.env.NODE_ENV !== "production" ? { ...result, resetUrl } : result;
}
