import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { sendWelcomeEmail } from "@/lib/email-notifications";
import { rateLimit, sanitizeText, validateStrongPassword, verifyCsrf } from "@/lib/security";

const registerSchema = z.object({
  name: z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), z.string().min(2).optional()),
  email: z.string().trim().email(),
  password: z.string().min(10).max(128),
  confirmPassword: z.string().min(10).max(128),
  phone: z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), z.string().optional())
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

function registrationError(issues: z.ZodFormattedError<z.infer<typeof registerSchema>>) {
  if (issues.email?._errors.length) return "Enter a valid email address to create your customer account.";
  if (issues.password?._errors.length) return "Password must be 10 to 128 characters.";
  if (issues.confirmPassword?._errors.length) return issues.confirmPassword._errors[0];
  if (issues.name?._errors.length) return "Name must be at least 2 characters when provided.";
  return "Please check your registration details.";
}

export async function POST(request: Request) {
  try {
    await rateLimit("register", 4, 60_000);
    await verifyCsrf(request);
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.format();
      return NextResponse.json({ error: registrationError(issues), issues: parsed.error.flatten() }, { status: 400 });
    }
    if (!validateStrongPassword(parsed.data.password)) {
      return NextResponse.json({ error: "Password must be at least 10 characters and include uppercase, lowercase, number, and symbol." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          name: parsed.data.name ? sanitizeText(parsed.data.name, 80) : undefined,
          phone: parsed.data.phone ? sanitizeText(parsed.data.phone, 30) : undefined,
          passwordHash: hashPassword(parsed.data.password),
          role: "CUSTOMER",
          customer: { create: {} }
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ error: "An account already exists for this email. Please login instead." }, { status: 409 });
      }
      throw error;
    }

    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    await setSessionCookie(sessionUser);
    const emailResult = await sendWelcomeEmail(user);
    if (!emailResult.ok && !emailResult.skipped) {
      console.warn("Email delivery failed for registration");
    }
    return NextResponse.json({ user: sessionUser }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
