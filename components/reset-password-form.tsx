"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { csrfFetch } from "@/lib/client-security";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [message, setMessage] = useState<string | null>(token ? null : "Reset token is missing.");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const response = await csrfFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token,
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword")
      })
    });
    const json = await response.json();
    setLoading(false);
    setSuccess(response.ok);
    setMessage(json.message ?? json.error ?? "Could not reset password.");
  }

  return (
    <form action={submit} className="rounded-lg border border-turmeric/16 bg-charcoal p-6 shadow-glow">
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm text-ivory/72">
          New password
          <input name="password" type="password" autoComplete="new-password" required className="field" />
        </label>
        <label className="grid gap-2 text-sm text-ivory/72">
          Confirm new password
          <input name="confirmPassword" type="password" autoComplete="new-password" required className="field" />
        </label>
      </div>
      {message ? <p className={`mt-4 rounded-lg border p-3 text-sm ${success ? "border-saffron/25 bg-saffron/10 text-ivory" : "border-rose/30 bg-rose/10 text-ivory"}`}>{message}</p> : null}
      <button disabled={loading || !token || success} className="mt-5 inline-flex w-full justify-center rounded-full bg-saffron px-6 py-4 font-semibold text-obsidian transition hover:bg-turmeric disabled:cursor-not-allowed disabled:opacity-70">
        {loading ? "Resetting..." : "Reset password"}
      </button>
      {success ? <Link href="/login" className="mt-4 inline-flex text-sm font-semibold text-saffron">Login with new password</Link> : null}
    </form>
  );
}
