"use client";

import Link from "next/link";
import { useState } from "react";
import { csrfFetch } from "@/lib/client-security";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    setDevResetLink(null);
    const response = await csrfFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: formData.get("email") })
    });
    const json = await response.json();
    setLoading(false);
    setMessage(json.message ?? json.error ?? "If account exists, email sent");
    if (json.devResetLink) setDevResetLink(json.devResetLink);
  }

  return (
    <form action={submit} className="rounded-lg border border-turmeric/16 bg-charcoal p-6 shadow-glow">
      <label className="grid gap-2 text-sm text-ivory/72">
        Email
        <input name="email" type="email" autoComplete="email" required className="field" />
      </label>
      {message ? <p className="mt-4 rounded-lg border border-turmeric/12 bg-obsidian p-3 text-sm text-ivory/70">{message}</p> : null}
      {devResetLink ? (
        <p className="mt-4 rounded-lg border border-saffron/25 bg-saffron/10 p-3 text-xs leading-5 text-ivory/70">
          Development reset link: <Link href={devResetLink} className="font-semibold text-saffron">open reset page</Link>
        </p>
      ) : null}
      <button disabled={loading} className="mt-5 inline-flex w-full justify-center rounded-full bg-saffron px-6 py-4 font-semibold text-obsidian transition hover:bg-turmeric disabled:cursor-wait disabled:opacity-70">
        {loading ? "Sending..." : "Send reset link"}
      </button>
      <Link href="/login" className="mt-4 inline-flex text-sm font-semibold text-saffron">Back to login</Link>
    </form>
  );
}
