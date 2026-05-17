import { PageShell } from "@/components/brand-shell";
import { AuthForm } from "@/components/auth-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Account access</p>
            <h1 className="mt-4 font-display text-6xl font-semibold text-ivory">Return to your kitchen.</h1>
            <p className="mt-4 text-ivory/64">Login to continue your Sacred Spices journey.</p>
          </div>
          <div className="mt-10">
            <Suspense fallback={<div className="mx-auto max-w-lg rounded-lg border border-turmeric/16 bg-charcoal p-6 text-ivory/64">Loading account form...</div>}>
              <AuthForm passwordResetAvailable />
            </Suspense>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
