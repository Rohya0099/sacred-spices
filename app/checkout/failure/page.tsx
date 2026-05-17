import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/brand-shell";

export default function CheckoutFailurePage() {
  return (
    <PageShell>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-rose/30 bg-charcoal p-8 text-center shadow-glow">
          <AlertTriangle className="mx-auto text-rose" size={44} />
          <h1 className="mt-5 font-display text-5xl font-semibold text-ivory">Payment could not be completed.</h1>
          <p className="mt-4 text-ivory/64">No worries. Your order has not been marked paid. You can return to checkout and try again.</p>
          <Link href="/checkout" className="mt-8 inline-flex rounded-full bg-saffron px-6 py-4 font-semibold text-obsidian">
            Return to checkout
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
