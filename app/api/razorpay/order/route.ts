import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertEnv, rateLimit, verifyCsrf } from "@/lib/security";

const orderSchema = z.object({
  orderId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    await rateLimit("razorpay-order", 8, 60_000);
    await verifyCsrf(request);
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment order." }, { status: 400 });
    }

    const localOrder = await prisma.order.findFirst({
      where: {
        id: parsed.data.orderId,
        userId: user.id
      },
      include: { items: { include: { product: true } } }
    });
    if (!localOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    if (localOrder.status !== "PLACED") {
      return NextResponse.json({ error: "Order is not awaiting payment." }, { status: 400 });
    }
    const pausedItem = localOrder.items.find((item) => !item.product.isActive);
    if (pausedItem) {
      return NextResponse.json({ error: "This product is currently unavailable." }, { status: 409 });
    }

    const keyId = assertEnv("RAZORPAY_KEY_ID");
    const keySecret = assertEnv("RAZORPAY_KEY_SECRET");
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const amount = Math.round(Number(localOrder.total) * 100);
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: localOrder.id,
      notes: {
        sacredOrderId: localOrder.id,
        trackingCode: localOrder.trackingCode
      }
    });

    await prisma.order.update({
      where: { id: localOrder.id },
      data: {
        razorpayOrderId: order.id
      }
    });

    return NextResponse.json({
      keyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
