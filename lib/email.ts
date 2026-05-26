import nodemailer from "nodemailer";

type EmailInput = {
  to: string;
  subject: string;
  text?: string;
  html: string;
  templateName?: string;
};

export type EmailResult =
  | { ok: true; skipped?: false }
  | { ok: false; skipped: true; reason: "smtp_not_configured" | "recipient_missing_or_invalid" }
  | { ok: false; skipped?: false; reason: "delivery_failed" };

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim();
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "Sacred Spices";

  if (!host || !port || !user || !pass || !fromEmail) return null;

  return {
    host,
    port,
    user,
    pass,
    from: `${fromName} <${fromEmail}>`
  };
}

export function isEmailConfigured() {
  return Boolean(smtpConfig());
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.replace(/pass(word)?=[^\s&]+/gi, "password=[redacted]").slice(0, 180);
  }
  return "unknown_error";
}

function htmlToText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function sendEmail({ to, subject, text, html, templateName = "unknown" }: EmailInput): Promise<EmailResult> {
  const config = smtpConfig();
  console.info(`Email service: SMTP configured = ${Boolean(config)}`);
  if (!config) {
    console.info("Email skipped: SMTP not configured");
    return { ok: false, skipped: true, reason: "smtp_not_configured" };
  }

  try {
    console.info(`Email send started: ${templateName}`);
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text: text ?? htmlToText(html),
      html
    });

    console.info(`Email send success: ${templateName}`);
    return { ok: true };
  } catch (error) {
    console.warn(`Email send failed: ${templateName} ${safeErrorMessage(error)}`);
    return { ok: false, reason: "delivery_failed" };
  }
}
