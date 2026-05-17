"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-3 text-sm font-semibold text-obsidian print:hidden"
    >
      <Printer size={16} />
      Print Invoice
    </button>
  );
}
