import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <LegalPage
      eyebrow="About Sacred Spices"
      title="Food carries energy, memory, and care."
      updatedAt="May 11, 2026"
      intro="Sacred Spices is a premium Indian food brand built around honest sourcing, soulful cooking, family rituals, and AI-assisted discovery without fake claims or borrowed authority."
      sections={[
        { title: "Our Philosophy", body: "Cooking is treated as attention, not a transaction. Every blend is designed to feel rooted, useful, and emotionally warm while staying truthful about what food can and cannot promise." },
        { title: "Our Products", body: "We focus on masalas, pickles, chutneys, regional blends, festive boxes, and future kitchen lifestyle products that respect Indian food traditions." },
        { title: "Our Promise", body: "No fake reviews, no medical shortcuts, no manipulative spirituality. The brand earns trust through quality, clarity, and care." }
      ]}
    />
  );
}
