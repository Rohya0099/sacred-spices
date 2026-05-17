import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { orderItems: { include: { order: true } } }
    });
    const rows = [
      ["productId", "slug", "name", "unitsOrdered", "confirmedUnits", "grossSales", "confirmedSales"],
      ...products.map((product) => {
        const unitsOrdered = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const confirmedItems = product.orderItems.filter((item) => item.order.status === "CONFIRMED");
        const confirmedUnits = confirmedItems.reduce((sum, item) => sum + item.quantity, 0);
        const grossSales = product.orderItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
        const confirmedSales = confirmedItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
        return [product.id, product.slug, product.name, unitsOrdered, confirmedUnits, grossSales, confirmedSales];
      })
    ];
    return csvResponse("sacred-spices-product-sales.csv", rows);
  } catch (error) {
    return handleApiError(error);
  }
}
