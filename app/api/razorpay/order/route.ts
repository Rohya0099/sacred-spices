import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimit, verifyCsrf } from "@/lib/security";

const orderSchema = z.object({
  orderId: z.string().min(1)
});

function isMissingOrDummy(value?: string) {
  return !value?.trim() || value.toLowerCase().includes("dummy");
}

function paymentUnavailable(reason: string) {
  console.warn(`Razorpay order unavailable: ${reason}`);
  return NextResponse.json({
    success: false,
    message: "Online payment is temporarily unavailable"
  });
}

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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (isMissingOrDummy(keyId) || isMissingOrDummy(keySecret)) {
      return paymentUnavailable(isMissingOrDummy(keyId) ? "missing_or_dummy_key_id" : "missing_or_dummy_key_secret");
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const amount = Math.round(Number(localOrder.total) * 100);
    let order;
    try {
      order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: localOrder.id,
        notes: {
          sacredOrderId: localOrder.id,
          trackingCode: localOrder.trackingCode
        }
      });
    } catch {
      return paymentUnavailable("razorpay_order_create_failed");
    }

    await prisma.order.update({
      where: { id: localOrder.id },
      data: {
        razorpayOrderId: order.id
      }
    });

    return NextResponse.json({
      success: true,
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
