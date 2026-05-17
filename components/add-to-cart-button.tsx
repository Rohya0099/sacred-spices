"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { csrfFetch } from "@/lib/client-security";

export function AddToCartButton({
  productId,
  className,
  label = "Add to cart",
  action = "cart",
  returnTo
}: {
  productId: string;
  className?: string;
  label?: string;
  action?: "cart" | "buy" | "preorder";
  returnTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function addToCart() {
    setStatus("loading");
    const response = await csrfFetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity: 1 })
    });

    if (response.status === 401) {
      const query = window.location.search;
      const currentPath = query ? `${pathname}${query}` : pathname;
      router.push(`/login?next=${encodeURIComponent(returnTo ?? currentPath)}`);
      return;
    }

    if (response.ok && action === "buy") {
      router.push("/checkout");
      return;
    }

    if (response.ok && action === "preorder") {
      router.push(`/checkout?preorder=${encodeURIComponent(productId)}`);
      return;
    }

    setStatus(response.ok ? "done" : "error");
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  return (
    <button
      onClick={addToCart}
      disabled={status === "loading"}
      className={
        className ??
        "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-saffron px-5 py-3 text-sm font-semibold text-obsidian transition hover:bg-turmeric disabled:cursor-wait disabled:opacity-70"
      }
    >
      <ShoppingBag size={17} />
      {status === "loading" ? (action === "cart" ? "Adding..." : "Preparing...") : status === "done" ? "Added" : status === "error" ? "Try again" : label}
    </button>
  );
}
