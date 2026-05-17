import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      include: { customer: true, orders: true }
    });
    const rows = [
      ["userId", "email", "name", "phone", "createdAt", "orders", "lifetimeValue"],
      ...users.map((user) => [
        user.id,
        user.email,
        user.name ?? "",
        user.phone ?? "",
        user.createdAt.toISOString(),
        user.orders.length,
        user.customer ? Number(user.customer.lifetimeValue) : ""
      ])
    ];
    return csvResponse("sacred-spices-customers.csv", rows);
  } catch (error) {
    return handleApiError(error);
  }
}
