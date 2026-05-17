import { prisma } from "@/lib/prisma";

export async function markOrderPaid({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  userId
}: {
  orderId?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  userId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        ...(orderId ? { id: orderId } : { razorpayOrderId }),
        ...(userId ? { userId } : {})
      },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      throw new Response("Order not found", { status: 404, statusText: "Order not found" });
    }

    if (order.status === "CONFIRMED") {
      return order;
    }

    const unavailable = order.items.find((item) => item.product.inventory < item.quantity);
    if (unavailable && !order.isPreorder) {
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      throw new Response("Insufficient stock", { status: 409, statusText: "Insufficient stock" });
    }

    if (!order.isPreorder) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inventory: { decrement: item.quantity } }
        });
      }
    }

    if (order.userId) {
      await tx.cartItem.deleteMany({ where: { cart: { is: { userId: order.userId } } } });
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED",
        razorpayOrderId,
        razorpayPaymentId
      },
      include: { items: { include: { product: true } } }
    });
  });
}
