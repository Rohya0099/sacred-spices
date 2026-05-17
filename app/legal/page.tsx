import type { Metadata } from "next";
import { FssaiTrustNote } from "@/components/fssai-trust-note";
import { LegalPage } from "@/components/legal-page";
import { businessInfo, fssaiDisplay, publicCityState, publicSupportEmail, publicSupportPhone } from "@/lib/business-info";

export const metadata: Metadata = { title: "Legal" };

export default function LegalPageRoute() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Legal and launch disclosures."
      updatedAt="May 13, 2026"
      intro="Sacred Spices is in early-access small-batch launch. This page keeps customer-facing legal, support, payment, and food-business disclosures in one place."
      sections={[
        { title: "FSSAI Status", body: `${fssaiDisplay}. No fake FSSAI number is displayed. The official registration number will be added once issued.` },
        { title: "Support", body: `Support replies within 24 hours. ${publicSupportEmail()}. ${publicSupportPhone()}.` },
        { title: "Business Location", body: publicCityState() },
        { title: "Shipping", body: `Processing time is ${businessInfo.shippingProcessingDays}. Delivery estimates are ${businessInfo.withinStateDelivery} within the same state and ${businessInfo.otherStateDelivery} for other states after dispatch.` },
        { title: "Pre-orders", body: `${businessInfo.preorderShippingText} Customers will be notified before dispatch.` },
        { title: "Payments and Claims", body: "Secure payments through Razorpay. No fake reviews. No false medical claims." }
      ]}
    >
      <FssaiTrustNote />
    </LegalPage>
  );
}
