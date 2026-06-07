import type { Metadata } from "next";
import { PageShell } from "@/components/brand-shell";
import { OrderStatusView } from "@/components/order-status-view";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Order Status",
  description: "View a Sacred Spices order status, product summary, and delivery tracking details.",
  path: "/orders/track",
  noIndex: true
});

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageShell>
      <OrderStatusView id={id} />
    </PageShell>
  );
}
