import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { businessInfo } from "@/lib/business-info";
import { handleApiError } from "@/lib/api";
import { verifyCsrf } from "@/lib/security";

const testEmailSchema = z.object({
  to: z.string().trim().email()
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await verifyCsrf(request);

    const body = await request.json().catch(() => null);
    const parsed = testEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const result = await sendEmail({
      to: parsed.data.to,
      templateName: "admin-test-email",
      subject: "Sacred Spices test email",
      text: "This is a Sacred Spices SMTP test email.",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1d130b;">
          <h1 style="margin:0 0 12px;">${businessInfo.brandName}</h1>
          <p>This is a test email from the Sacred Spices admin console.</p>
          <p>If you received this, SMTP delivery is working.</p>
        </div>
      `
    });

    if (!result.ok) {
      return NextResponse.json({
        success: false,
        skipped: result.skipped ?? false,
        message: result.skipped ? "SMTP is not configured." : "Email delivery failed."
      }, { status: result.skipped ? 200 : 502 });
    }

    return NextResponse.json({ success: true, message: "Test email sent." });
  } catch (error) {
    return handleApiError(error);
  }
}
