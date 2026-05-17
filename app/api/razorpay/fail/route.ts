import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { rateLimit, verifyCsrf } from "@/lib/security";

const failSchema = z.object({
  orderId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    await rateLimit("razorpay-fail", 12, 60_000);
    await verifyCsrf(request);
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = failSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid payment failure payload." }, { status: 400 });

    const order = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, userId: user.id }
    });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.status !== "CONFIRMED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" }
      });
    }

    return NextResponse.json({ status: "marked-failed" });
  } catch (error) {
    return handleApiError(error);
  }
}
