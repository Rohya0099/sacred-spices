import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { rateLimit, validateStrongPassword, verifyCsrf } from "@/lib/security";
import { hashPasswordResetToken } from "@/lib/password-reset";

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(10).max(128),
  confirmPassword: z.string().min(10).max(128)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

export async function POST(request: Request) {
  try {
    await rateLimit("reset-password", 8, 60 * 60 * 1000);
    await verifyCsrf(request);
    const body = await request.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid reset request." }, { status: 400 });
    if (!validateStrongPassword(parsed.data.password)) {
      return NextResponse.json({ error: "Password must be at least 10 characters and include uppercase, lowercase, number, and symbol." }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(parsed.data.token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: hashPassword(parsed.data.password) }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      }),
      prisma.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, usedAt: null, id: { not: resetToken.id } },
        data: { usedAt: new Date() }
      })
    ]);

    return NextResponse.json({ message: "Password has been reset. Please login with your new password." });
  } catch (error) {
    return handleApiError(error);
  }
}
