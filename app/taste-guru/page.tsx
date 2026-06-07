import type { Metadata } from "next";
import { PageShell } from "@/components/brand-shell";
import { TasteGuru } from "@/components/taste-guru";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "AI Taste Guru for Indian Spices",
  description: "Use AI Taste Guru to discover Sacred Spices masalas, pickles, chai blends, and Indian spice recommendations for your cooking style.",
  path: "/taste-guru"
});

export default function TasteGuruPage() {
  return (
    <PageShell>
      <TasteGuru />
    </PageShell>
  );
}
