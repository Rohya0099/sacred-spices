import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { assertEnv, rateLimit, verifyCsrf } from "@/lib/security";
import { markOrderPaid } from "@/lib/orders";

const verifySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    await rateLimit("razorpay-verify", 12, 60_000);
    await verifyCsrf(request);
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid verification payload." }, { status: 400 });

    const keySecret = assertEnv("RAZORPAY_KEY_SECRET");
    const localOrder = await prisma.order.findFirst({
      where: {
        id: parsed.data.orderId,
        userId: user.id,
        razorpayOrderId: parsed.data.razorpayOrderId
      }
    });
    if (!localOrder) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (localOrder.status === "CONFIRMED") {
      const samePayment = localOrder.razorpayPaymentId === parsed.data.razorpayPaymentId;
      return NextResponse.json({
        verified: samePayment,
        orderId: localOrder.id,
        trackingCode: localOrder.trackingCode,
        replay: true
      }, { status: samePayment ? 200 : 409 });
    }

    const expected = createHmac("sha256", keySecret)
      .update(`${parsed.data.razorpayOrderId}|${parsed.data.razorpayPaymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(parsed.data.razorpaySignature);
    const verified = expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
    if (!verified) {
      await prisma.order.update({
        where: { id: parsed.data.orderId },
        data: { status: "CANCELLED" }
      });
      return NextResponse.json({ verified: false, error: "Payment signature verification failed." }, { status: 400 });
    }

    const order = await markOrderPaid({
      orderId: parsed.data.orderId,
      userId: user.id,
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId
    });

    return NextResponse.json({ verified: true, orderId: order.id, trackingCode: order.trackingCode });
  } catch (error) {
    return handleApiError(error);
  }
}
