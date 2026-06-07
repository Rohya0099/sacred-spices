import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy for Sacred Spices",
  description: "Understand how Sacred Spices handles account, order, payment, support, and personalization data.",
  path: "/privacy-policy"
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Respectful data use for commerce and personalization."
      updatedAt="May 11, 2026"
      intro="Sacred Spices collects only the information needed to operate accounts, orders, support, payments, AI recommendations, and community features."
      sections={[
        { title: "Data We Collect", body: "Account details, addresses, order history, wishlist items, subscription preferences, community posts, and AI prompts may be stored to provide the service." },
        { title: "Payments", body: "Secure payments are handled through Razorpay. Payment verification is handled server-side. Card or UPI credentials are handled by Razorpay and should not be stored by this app." },
        { title: "AI Features", body: "AI prompts are limited and stored for history and quality. Users should not enter sensitive personal information into AI tools." }
      ]}
    />
  );
}
