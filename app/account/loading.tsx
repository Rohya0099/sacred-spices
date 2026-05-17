import { PageShell } from "@/components/brand-shell";

export default function AccountLoading() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Customer account</p>
          <div className="mt-6 h-16 max-w-xl animate-pulse rounded-lg bg-turmeric/10" />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-lg border border-turmeric/12 bg-charcoal" />
            <div className="h-64 animate-pulse rounded-lg border border-turmeric/12 bg-charcoal" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
