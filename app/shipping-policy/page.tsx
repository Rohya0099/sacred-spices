import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { businessInfo } from "@/lib/business-info";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Shipping Policy"
      title="Clear delivery expectations for every order."
      updatedAt="May 11, 2026"
      intro="Shipping timelines are shared honestly for the early-access small-batch launch and may be updated as operations mature."
      sections={[
        { title: "Processing", body: `Orders are prepared after payment confirmation. Current processing time is ${businessInfo.shippingProcessingDays}.` },
        { title: "Delivery Timeline", body: `Estimated delivery is ${businessInfo.withinStateDelivery} within the same state and ${businessInfo.otherStateDelivery} for other states after dispatch.` },
        { title: "Pre-orders", body: `${businessInfo.preorderShippingText} Customers will be notified before dispatch.` },
        { title: "Tracking", body: "Customers can use the order tracking page to follow PLACED, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED, or REFUNDED states." },
        { title: "Delivery Issues", body: "If a parcel is delayed, damaged, or returned, support should verify carrier data and respond with a practical resolution." }
      ]}
    />
  );
}
