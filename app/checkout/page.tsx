import type { Metadata } from "next";
import { PageShell } from "@/components/brand-shell";
import { CheckoutFlow } from "@/components/checkout-flow";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Secure Checkout",
  description: "Review your Sacred Spices cart, delivery address, and secure Razorpay payment for pure vegetarian Indian food products.",
  path: "/checkout",
  noIndex: true
});

export default function CheckoutPage() {
  return (
    <PageShell>
      <CheckoutFlow />
    </PageShell>
  );
}
