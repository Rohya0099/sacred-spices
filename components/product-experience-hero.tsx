"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { ProductPremiumInteraction } from "@/components/product-premium-interaction";
import { ProductImage } from "@/components/product-image";

type ProductExperienceHeroProps = {
  name: string;
  category: string;
  image?: string | null;
  images?: string[];
};

export function ProductExperienceHero({ name, category, image, images = [] }: ProductExperienceHeroProps) {
  const gallery = useMemo(() => Array.from(new Set([image, ...images].filter(Boolean))) as string[], [image, images]);
  const [activeImage, setActiveImage] = useState(gallery[0] ?? image ?? null);

  return (
    <div className="grid gap-3">
      <ProductPremiumInteraction
        name={name}
        category={category}
        image={activeImage}
        priority
        className="h-[18rem] sm:h-[24rem] lg:h-[calc(100vh-12rem)] lg:min-h-[24rem] lg:max-h-[32rem]"
      >
        <ProductHeroCaption name={name} category={category} />
      </ProductPremiumInteraction>
      {gallery.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {gallery.slice(0, 4).map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveImage(item)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-obsidian transition ${
                activeImage === item ? "border-saffron" : "border-turmeric/16 hover:border-turmeric/40"
              }`}
              aria-label={`Show ${name} image ${index + 1}`}
            >
              <ProductImage src={item} alt={`${name} thumbnail ${index + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductHeroCaption({ name, category }: { name: string; category: string }) {
  return (
    <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between gap-4 sm:bottom-6 sm:left-6 sm:right-6">
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-saffron">{category}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ivory sm:text-3xl">{name}</p>
      </div>
      <div className="hidden rounded-full border border-saffron/30 bg-obsidian/80 p-3 text-saffron sm:block">
        <Sparkles size={20} />
      </div>
    </div>
  );
}
