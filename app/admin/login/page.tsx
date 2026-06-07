import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/brand-shell";
import { AuthForm } from "@/components/auth-form";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Admin Login",
  description: "Protected Sacred Spices admin login for authorized operators.",
  path: "/admin/login",
  noIndex: true
});

export default function AdminLoginPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Admin access</p>
            <h1 className="mt-4 font-display text-5xl font-semibold text-ivory">Sacred Spices Admin</h1>
          </div>
          <div className="mt-10">
            <Suspense fallback={<div className="mx-auto max-w-lg rounded-lg border border-turmeric/16 bg-charcoal p-6 text-ivory/64">Loading admin login...</div>}>
              <AuthForm role="ADMIN" passwordResetAvailable />
            </Suspense>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
