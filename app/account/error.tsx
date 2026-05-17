"use client";

import Link from "next/link";

export default function AccountError() {
  return (
    <main className="min-h-screen bg-obsidian px-4 py-16 text-ivory sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-rose/30 bg-charcoal p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose">Account unavailable</p>
        <h1 className="mt-4 font-display text-5xl text-ivory">We could not load your account.</h1>
        <p className="mt-4 text-ivory/68">Please refresh or sign in again. No account data was changed.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-saffron px-5 py-3 font-semibold text-obsidian">Go to login</Link>
      </section>
    </main>
  );
}
