import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms and conditions for using Sacred Spices."
      updatedAt="May 11, 2026"
      intro="These terms describe the early-access small-batch launch experience and should be read with the shipping, refund, privacy, and FSSAI pages."
      sections={[
        { title: "Use of Service", body: "Customers may browse products, create accounts, place orders, save wishlists, and use AI features for lawful personal use." },
        { title: "Product Information", body: "Descriptions are provided for taste, story, ingredients, and usage guidance. They must not be treated as medical advice." },
        { title: "Orders", body: "Orders are subject to stock availability, successful Razorpay payment verification, shipping coverage, and operational review for unusual activity." },
        { title: "Trust Policy", body: "No fake reviews. No false medical claims. Secure payments through Razorpay." }
      ]}
    />
  );
}
