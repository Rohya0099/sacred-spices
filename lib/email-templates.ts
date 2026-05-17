import { businessInfo } from "@/lib/business-info";

export function passwordResetEmailTemplate({ resetUrl }: { resetUrl: string }) {
  return {
    subject: `${businessInfo.brandName} password reset`,
    text: [
      `We received a request to reset your ${businessInfo.brandName} password.`,
      "",
      "Use this secure link to choose a new password:",
      resetUrl,
      "",
      "This link expires in 45 minutes and can be used only once.",
      "If you did not request this, you can ignore this email."
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1d130b; line-height: 1.6;">
        <h1 style="margin: 0 0 12px;">${businessInfo.brandName}</h1>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetUrl}" style="color: #9a5b00; font-weight: 700;">Reset your password</a></p>
        <p>This link expires in 45 minutes and can be used only once.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `
  };
}
