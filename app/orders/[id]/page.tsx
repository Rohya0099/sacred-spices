import { PageShell } from "@/components/brand-shell";
import { OrderStatusView } from "@/components/order-status-view";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageShell>
      <OrderStatusView id={id} />
    </PageShell>
  );
}
