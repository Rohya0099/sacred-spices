import { NextResponse } from "next/server";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { assertEnv } from "@/lib/security";
import { markOrderPaid } from "@/lib/orders";

type RazorpayWebhookPayload = {
  id?: string;
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
  };
};

function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  try {
    const webhookSecret = assertEnv("RAZORPAY_WEBHOOK_SECRET");
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });

    const rawBody = await request.text();
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const eventId = payload.id ?? `${payload.event}:${payload.payload?.payment?.entity?.id ?? randomUUID()}`;
    const payment = payload.payload?.payment?.entity;
    try {
      await prisma.paymentWebhookEvent.create({
        data: {
          eventId,
          eventType: payload.event ?? "unknown",
          razorpayOrderId: payment?.order_id,
          razorpayPaymentId: payment?.id,
          raw: payload
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw error;
    }

    if (payload.event === "payment.captured" && payment?.order_id && payment.id) {
      await markOrderPaid({
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id
      });
    }

    if (payload.event === "payment.failed" && payment?.order_id) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: payment.order_id, status: { not: "CONFIRMED" } },
        data: { status: "CANCELLED", razorpayPaymentId: payment.id }
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
