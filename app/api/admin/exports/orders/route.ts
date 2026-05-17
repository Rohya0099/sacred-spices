import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, items: { include: { product: true } } }
    });
    const rows = [
      ["orderId", "trackingCode", "createdAt", "customerEmail", "customerName", "status", "isPreorder", "subtotal", "discount", "shipping", "total", "razorpayOrderId", "razorpayPaymentId", "items"],
      ...orders.map((order) => [
        order.id,
        order.trackingCode,
        order.createdAt.toISOString(),
        order.user?.email ?? "",
        order.user?.name ?? "",
        order.status,
        order.isPreorder ? "yes" : "no",
        Number(order.subtotal),
        Number(order.discount),
        Number(order.shipping),
        Number(order.total),
        order.razorpayOrderId ?? "",
        order.razorpayPaymentId ?? "",
        order.items.map((item) => `${item.quantity}x ${item.product.name}`).join("; ")
      ])
    ];
    return csvResponse("sacred-spices-orders.csv", rows);
  } catch (error) {
    return handleApiError(error);
  }
}
