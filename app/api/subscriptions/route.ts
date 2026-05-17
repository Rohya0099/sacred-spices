import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { rateLimit, verifyCsrf } from "@/lib/security";

const subscriptionSchema = z.object({
  spicePreference: z.string().min(1),
  familySize: z.string().min(1),
  region: z.string().min(1),
  spicyLevel: z.number().int().min(1).max(5)
});

export async function POST(request: Request) {
  try {
    await rateLimit("subscriptions", 8, 60_000);
    await verifyCsrf(request);
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = subscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid subscription preferences." }, { status: 400 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        name: "Sacred Monthly Box",
        ...parsed.data
      }
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
