import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminOrderDetail } from "@/components/admin-order-detail";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeAdminOrder } from "@/lib/serializers";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Admin Order Detail",
  description: "Protected Sacred Spices admin order detail page.",
  path: "/admin/orders",
  noIndex: true
});

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { trackingCode: id }] },
    include: { user: true, items: { include: { product: true } } }
  });
  if (!order) notFound();

  return <AdminOrderDetail initialOrder={JSON.parse(JSON.stringify(serializeAdminOrder(order)))} />;
}
