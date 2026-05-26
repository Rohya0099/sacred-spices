import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { rateLimit, verifyCsrf } from "@/lib/security";
import { createPasswordResetToken, getPasswordResetUrl, hashPasswordResetToken, PASSWORD_RESET_MINUTES, sendPasswordResetEmail } from "@/lib/password-reset";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

const genericMessage = "If account exists, email sent";

export async function POST(request: Request) {
  try {
    await rateLimit("forgot-password", 5, 60 * 60 * 1000);
    await verifyCsrf(request);

    const body = await request.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: genericMessage });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    let devResetLink: string | undefined;

    if (user?.passwordHash) {
      const token = createPasswordResetToken();
      const resetUrl = getPasswordResetUrl(token);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashPasswordResetToken(token),
          expiresAt: new Date(Date.now() + PASSWORD_RESET_MINUTES * 60 * 1000)
        }
      });
      const sent = await sendPasswordResetEmail(user.email, resetUrl);
      if (process.env.NODE_ENV !== "production" && "resetUrl" in sent) {
        devResetLink = sent.resetUrl;
      }
    }

    return NextResponse.json({
      message: genericMessage,
      ...(devResetLink ? { devResetLink } : {})
    });
  } catch (error) {
    return handleApiError(error);
  }
}
