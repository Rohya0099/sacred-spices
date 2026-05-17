import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Refund Policy"
      title="Fair support for damaged, incorrect, or failed orders."
      updatedAt="May 11, 2026"
      intro="Food products require careful handling. This policy is written to avoid overpromising and to keep customer support clear."
      sections={[
        { title: "Eligible Cases", body: "Refund or replacement review may apply to failed payments, duplicate charges, damaged parcels, wrong items, or verified fulfillment errors." },
        { title: "Food Safety", body: "Food products cannot be returned after delivery or opening unless the issue relates to damage, quality concern, or an incorrect shipment." },
        { title: "Damage or Wrong Item", body: "Damaged or wrong items must be reported within 24 hours of delivery with clear photos of the package and product." },
        { title: "Timeline", body: "Approved refunds are processed through the original payment method according to Razorpay and banking timelines." }
      ]}
    />
  );
}
