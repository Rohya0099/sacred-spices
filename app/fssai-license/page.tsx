import type { Metadata } from "next";
import { FssaiTrustNote } from "@/components/fssai-trust-note";
import { LegalPage } from "@/components/legal-page";
import { businessInfo, fssaiDisplay } from "@/lib/business-info";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "FSSAI Registration Status",
  description: "View Sacred Spices FSSAI registration status and food business launch disclosures.",
  path: "/fssai-license"
});

export default function FssaiLicensePage() {
  return (
    <LegalPage
      eyebrow="FSSAI and license"
      title={fssaiDisplay}
      updatedAt="May 11, 2026"
      intro="Sacred Spices is in early-access small-batch launch. No fake FSSAI number is displayed, and the registration number will be added only after official approval."
      sections={[
        { title: "Current Status", body: `${fssaiDisplay}. The final 14-digit registration number will be shown here once issued.` },
        { title: "Official Portal", body: `Food business registration and related payments should be completed only through the official FoSCoS portal: ${businessInfo.officialFoscosUrl}.` },
        { title: "Claims Policy", body: "No fake reviews. No false medical claims. Product descriptions are for taste, ingredients, usage, and order information only." }
      ]}
    >
      <FssaiTrustNote />
    </LegalPage>
  );
}
