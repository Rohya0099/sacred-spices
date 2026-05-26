"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductPremiumInteraction } from "@/components/product-premium-interaction";

export type ProductCardData = {
  slug: string;
  name: string;
  category: string;
  price: number;
  image?: string | null;
  weight?: string | null;
  spiceLevelLabel?: string | null;
  inventory?: number;
  taste: string;
  spice: number;
  story: string;
  badge?: string | null;
  isPreorderEligible?: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-turmeric/16 bg-charcoal shadow-glow transition hover:border-turmeric/28">
      <Link href={`/products/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
        <div className="relative h-48 overflow-hidden bg-obsidian sm:h-52 lg:h-60">
          <ProductPremiumInteraction
            name={product.name}
            category={product.category}
            image={product.image}
            compact
            className="h-full rounded-none border-0 shadow-none"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-turmeric/30 bg-obsidian/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-turmeric">
            {product.category}
          </span>
          {product.badge ? (
            <span className="absolute right-4 top-4 rounded-full bg-saffron px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-obsidian">
              {product.badge}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={`/products/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
          <h3 className="font-display text-2xl font-semibold leading-tight text-ivory transition group-hover:text-saffron">{product.name}</h3>
          <p className="mt-1.5 text-sm leading-5 text-ivory/60">{product.taste}</p>
        </Link>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-ember" aria-label={`Spice level ${product.spice} out of 5`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Flame key={index} size={15} className={index < product.spice ? "fill-current opacity-100" : "opacity-25"} />
            ))}
          </div>
          {product.spiceLevelLabel ? <span className="rounded-full border border-turmeric/20 px-3 py-1 text-xs text-ivory/62">{product.spiceLevelLabel}</span> : null}
        </div>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-ivory/62">{product.story}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-saffron">Rs. {product.price.toLocaleString("en-IN")}</p>
            {product.weight ? <p className="mt-1 text-xs text-ivory/45">{product.weight}</p> : null}
          </div>
          {typeof product.inventory === "number" && product.inventory <= 20 ? (
            <span className="rounded-full border border-ember/30 px-3 py-1 text-[0.68rem] font-semibold text-ember">Only {product.inventory} left</span>
          ) : null}
        </div>
        <div className="mt-auto grid gap-3 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <AddToCartButton productId={product.slug} returnTo={`/products/${product.slug}`} />
            <AddToCartButton
              productId={product.slug}
              action="buy"
              label="Buy now"
              returnTo={`/products/${product.slug}`}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-saffron/60 px-4 py-2.5 text-sm font-semibold text-saffron transition hover:bg-saffron hover:text-obsidian disabled:cursor-wait disabled:opacity-70"
            />
          </div>
          {product.isPreorderEligible ? (
            <AddToCartButton
              productId={product.slug}
              action="preorder"
              label="Pre-order Now"
              returnTo={`/products/${product.slug}`}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-turmeric/35 bg-obsidian px-5 py-3 text-sm font-semibold text-ivory transition hover:border-saffron hover:text-saffron disabled:cursor-wait disabled:opacity-70"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
