import { businessInfo, fssaiDisplay } from "@/lib/business-info";

type FssaiTrustNoteProps = {
  compact?: boolean;
};

export function FssaiTrustNote({ compact = false }: FssaiTrustNoteProps) {
  return (
    <div className="rounded-lg border border-saffron/20 bg-saffron/10 p-4">
      <p className="text-sm font-semibold text-saffron">{fssaiDisplay}</p>
      <p className={`${compact ? "mt-2 text-xs leading-5" : "mt-3 text-sm leading-6"} text-ivory/70`}>
        Sacred Spices is in early-access small-batch launch. FSSAI registration is in process, and the registration number will be displayed here once issued.
      </p>
      {!compact ? (
        <p className="mt-3 text-xs leading-5 text-ivory/52">
          Food business registration and payments should be completed only through the official FoSCoS portal: {businessInfo.officialFoscosUrl}.
        </p>
      ) : null}
    </div>
  );
}
