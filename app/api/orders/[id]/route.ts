import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { serializeOrder, serializePublicOrder } from "@/lib/serializers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { trackingCode: id }],
        ...(user?.role === "ADMIN" ? {} : user ? { userId: user.id } : { trackingCode: id })
      },
      include: { items: { include: { product: true } } }
    });

    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order: user?.role === "ADMIN" ? serializeOrder(order) : serializePublicOrder(order) });
  } catch (error) {
    return handleApiError(error);
  }
}
