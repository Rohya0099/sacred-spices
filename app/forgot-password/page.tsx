import { PageShell } from "@/components/brand-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Password help</p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-ivory sm:text-6xl">Reset your password.</h1>
          <p className="mt-4 text-ivory/64">Enter your account email. For security, we will show the same response whether or not an account exists.</p>
          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
