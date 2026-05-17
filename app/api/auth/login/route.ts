import { NextResponse } from "next/server";
import { z } from "zod";
import { loginWithPassword, setSessionCookie } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { rateLimit, verifyCsrf } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  expectedRole: z.enum(["CUSTOMER", "ADMIN"]).optional()
});

export async function POST(request: Request) {
  try {
    await rateLimit("login", 8, 60_000);
    await verifyCsrf(request);
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });

    const user = await loginWithPassword(parsed.data.email, parsed.data.password);
    if (!user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    if (parsed.data.expectedRole && user.role !== parsed.data.expectedRole) {
      return NextResponse.json({ error: "This account cannot sign in here." }, { status: 403 });
    }

    await setSessionCookie(user);
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
