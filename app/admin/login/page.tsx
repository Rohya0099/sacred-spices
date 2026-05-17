import { Suspense } from "react";
import { PageShell } from "@/components/brand-shell";
import { AuthForm } from "@/components/auth-form";

export default function AdminLoginPage() {
  const passwordResetAvailable = Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);

  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Admin access</p>
            <h1 className="mt-4 font-display text-6xl font-semibold text-ivory">Sacred Spices control room.</h1>
            <p className="mt-4 text-ivory/64">Sign in with an admin account to manage products, inventory, orders, and AI marketing tools.</p>
          </div>
          <div className="mt-10">
            <Suspense fallback={<div className="mx-auto max-w-lg rounded-lg border border-turmeric/16 bg-charcoal p-6 text-ivory/64">Loading admin login...</div>}>
              <AuthForm role="ADMIN" passwordResetAvailable={passwordResetAvailable} />
            </Suspense>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
