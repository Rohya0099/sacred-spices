import type { Metadata } from "next";
import { PageShell } from "@/components/brand-shell";
import { TrackOrderForm } from "@/components/track-order-form";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Track Your Order",
  description: "Track your Sacred Spices order status and delivery progress using your tracking code.",
  path: "/orders/track",
  noIndex: true
});

export default function TrackOrderPage() {
  return (
    <PageShell>
      <TrackOrderForm />
    </PageShell>
  );
}
