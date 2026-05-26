import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email-notifications";
import { serializeAdminOrder } from "@/lib/serializers";
import { verifyCsrf } from "@/lib/security";

const statusSchema = z.object({
  status: z.enum(["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  adminNote: z.string().max(2000).optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await verifyCsrf(request);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success || (!parsed.data.status && parsed.data.adminNote === undefined)) {
      return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const fulfillmentReadyStatuses = ["CONFIRMED", "PACKED", "SHIPPED"];
    if (parsed.data.status && ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"].includes(parsed.data.status) && !fulfillmentReadyStatuses.includes(existing.status)) {
      return NextResponse.json({ error: "Only paid or confirmed orders can move into fulfillment." }, { status: 409 });
    }
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.adminNote !== undefined ? { adminNote: parsed.data.adminNote } : {})
      },
      include: { user: true, items: { include: { product: true } } }
    });
    const emailStatuses = ["PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
    if (parsed.data.status && parsed.data.status !== existing.status && emailStatuses.includes(parsed.data.status)) {
      const emailResult = await sendOrderStatusEmail(order);
      if (!emailResult.ok && !emailResult.skipped) {
        console.warn("Email delivery failed for order status update");
      }
    }

    return NextResponse.json({ order: serializeAdminOrder(order) });
  } catch (error) {
    return handleApiError(error);
  }
}
