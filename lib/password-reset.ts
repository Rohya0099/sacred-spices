import { createHash, randomBytes } from "crypto";
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

function hasEmailProvider() {
  return Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const template = passwordResetEmailTemplate({ resetUrl });
  if (process.env.NODE_ENV === "production" && !hasEmailProvider()) {
    throw new Error("Password reset email provider is not configured.");
  }

  if (process.env.NODE_ENV !== "production") {
    return { provider: "development", template, email, resetUrl };
  }

  // Provider-neutral placeholder: wire Resend or SendGrid here before enabling production resets.
  return { provider: process.env.RESEND_API_KEY ? "resend" : "sendgrid", template, email };
}
