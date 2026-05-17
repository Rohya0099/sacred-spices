import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { serializeAdminOrder } from "@/lib/serializers";
import type { OrderStatus } from "@prisma/client";
import { z } from "zod";

const statusQuerySchema = z.enum(["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]);

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get("status");
    const status = rawStatus ? statusQuerySchema.safeParse(rawStatus) : null;
    if (status && !status.success) {
      return NextResponse.json({ error: "Invalid order status filter." }, { status: 400 });
    }
    const orders = await prisma.order.findMany({
      where: status?.success ? { status: status.data as OrderStatus } : {},
      orderBy: { createdAt: "desc" },
      include: { user: true, items: { include: { product: true } } }
    });

    return NextResponse.json({ orders: orders.map(serializeAdminOrder) });
  } catch (error) {
    return handleApiError(error);
  }
}
