import { Suspense } from "react";
import { PageShell } from "@/components/brand-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Reset Password",
  description: "Choose a new Sacred Spices account password using your secure reset link.",
  path: "/reset-password",
  noIndex: true
});

export default function ResetPasswordPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Secure reset</p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-ivory sm:text-6xl">Choose a new password.</h1>
          <p className="mt-4 text-ivory/64">Use the reset link from your email. Reset links expire and can be used only once.</p>
          <div className="mt-8">
            <Suspense fallback={<div className="rounded-lg border border-turmeric/16 bg-charcoal p-6 text-ivory/64">Loading reset form...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
