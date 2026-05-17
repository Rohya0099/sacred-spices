"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function TrackOrderForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Order tracking</p>
        <h1 className="mt-4 font-display text-6xl font-semibold text-ivory">Follow your order.</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim()) router.push(`/orders/${code.trim()}`);
          }}
          className="mt-8 flex gap-3 rounded-lg border border-turmeric/16 bg-charcoal p-4"
        >
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Order ID or tracking code" className="field flex-1" />
          <button className="inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-3 font-semibold text-obsidian">
            <Search size={17} />
            Track
          </button>
        </form>
      </div>
    </section>
  );
}
