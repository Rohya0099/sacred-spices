import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/brand-shell";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  return (
    <PageShell>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-turmeric/16 bg-charcoal p-8 text-center shadow-glow">
          <CheckCircle2 className="mx-auto text-saffron" size={44} />
          <h1 className="mt-5 font-display text-5xl font-semibold text-ivory">Payment received.</h1>
          <p className="mt-4 text-ivory/64">Your Sacred Spices order is confirmed and moving into careful preparation.</p>
          {params.order ? (
            <Link href={`/orders/${params.order}`} className="mt-8 inline-flex rounded-full bg-saffron px-6 py-4 font-semibold text-obsidian">
              Track order
            </Link>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
