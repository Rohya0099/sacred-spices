"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChefHat, Gift, Sparkles, UsersRound, Utensils } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { csrfFetch } from "@/lib/client-security";
import { resolveProductImage } from "@/lib/product-images";

const questions = [
  { key: "heat", label: "Spicy or mild?", options: ["Gentle", "Medium", "Bold"] },
  { key: "mood", label: "Tangy or smoky?", options: ["Tangy", "Smoky", "Balanced"] },
  { key: "region", label: "North or South Indian taste?", options: ["North", "South", "Mixed"] },
  { key: "occasion", label: "Daily cooking or special occasion?", options: ["Daily", "Weekend", "Festival"] },
  { key: "family", label: "Family size?", options: ["1-2", "3-4", "5+"] },
  { key: "dish", label: "Preferred dishes?", options: ["Dal and sabzi", "Rice and rasam", "Grills and curries"] }
] as const;

type Recommendation = {
  product: {
    name: string;
    slug: string;
    price: number;
    images: string[];
    inventory: number;
    category?: { name: string } | null;
  };
  reason: string;
  score: number;
  isPreorderAvailable: boolean;
};

type TasteGuruResponse = {
  exact: boolean;
  recommendations: Recommendation[];
};

export function TasteGuru() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TasteGuruResponse | null>(null);
  const [message, setMessage] = useState("Answer at least three questions and the Taste Guru will begin shaping a recommendation.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(answers).length < 3) {
      setResult(null);
      setMessage("Answer at least three questions and the Taste Guru will begin shaping a recommendation.");
      return;
    }

    let cancelled = false;
    async function recommend() {
      setLoading(true);
      setMessage("Reading your preferences against the Sacred Spices catalog...");
      const response = await csrfFetch("/api/taste-guru", {
        method: "POST",
        body: JSON.stringify(answers)
      });
      const json = await response.json();
      if (cancelled) return;
      setLoading(false);
      if (!response.ok) {
        setResult(null);
        setMessage(json.error ?? "Could not create a recommendation right now.");
        return;
      }
      setResult(json);
      setMessage(json.exact ? "Matched with products from the live catalog." : "No exact match found. Showing the closest matching products.");
    }

    recommend();
    return () => {
      cancelled = true;
    };
  }, [answers]);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">AI Taste Guru</p>
          <h1 className="mt-4 font-display text-6xl font-semibold leading-tight text-ivory">A thoughtful guide for your table.</h1>
          <p className="mt-5 text-lg leading-8 text-ivory/68">
            AI Taste Guru helps customers choose the right spice, pickle, combo, or monthly box based on family size, occasion, preferred dishes, and cooking style.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Personalized spice suggestion", copy: "Match heat, region, and daily cooking habits to the right blend." },
            { icon: Utensils, title: "Perfect combo for your meal", copy: "Pair pickles, masalas, and pantry staples around what you plan to cook." },
            { icon: UsersRound, title: "Festival and family-size guidance", copy: "Choose boxes and quantities with the people at your table in mind." }
          ].map((item) => (
            <article key={item.title} className="rounded-lg border border-turmeric/16 bg-charcoal p-5">
              <item.icon className="text-saffron" size={24} />
              <h2 className="mt-4 font-display text-2xl text-ivory">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ivory/64">{item.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            {questions.map((question) => (
              <div key={question.key} className="rounded-lg border border-turmeric/16 bg-charcoal p-5">
                <p className="font-display text-2xl text-ivory">{question.label}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.key]: option }))}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        answers[question.key] === option
                          ? "border-saffron bg-saffron text-obsidian"
                          : "border-turmeric/20 text-ivory/70 hover:border-saffron hover:text-saffron"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-lg border border-turmeric/16 bg-charcoal p-6 text-ivory lg:sticky lg:top-28 lg:self-start">
            <Gift className="text-saffron" size={26} />
            <h2 className="mt-5 font-display text-4xl font-semibold text-ivory">Your recommendation</h2>
            <p className="mt-3 rounded-lg border border-turmeric/12 bg-obsidian px-4 py-3 text-sm leading-6 text-ivory/72">
              {loading ? "Finding the closest catalog match..." : message}
            </p>

            {result?.recommendations.length ? (
              <div className="mt-6 grid gap-4">
                {result.recommendations.map((item) => (
                  <article key={item.product.slug} className="grid gap-4 rounded-lg border border-turmeric/16 bg-obsidian p-4 sm:grid-cols-[140px_1fr]">
                    <Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden rounded-lg border border-turmeric/12 bg-charcoal">
                      <ProductImage
                        src={resolveProductImage({
                          name: item.product.name,
                          slug: item.product.slug,
                          category: item.product.category?.name,
                          images: item.product.images
                        })}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="140px"
                      />
                    </Link>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-saffron">{item.product.category?.name ?? "Sacred Spices"}</p>
                      <h3 className="mt-2 font-display text-3xl text-ivory">{item.product.name}</h3>
                      <p className="mt-1 text-lg font-semibold text-saffron">Rs. {item.product.price.toLocaleString("en-IN")}</p>
                      <p className="mt-3 text-sm leading-6 text-ivory/70">{item.reason}</p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <Link href={`/products/${item.product.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-full border border-turmeric/25 px-4 py-2 text-sm font-semibold text-saffron transition hover:border-saffron">
                          View Product
                        </Link>
                        <AddToCartButton productId={item.product.slug} returnTo="/taste-guru" />
                        {item.isPreorderAvailable ? (
                          <AddToCartButton
                            productId={item.product.slug}
                            action="preorder"
                            label="Pre-order Now"
                            returnTo="/taste-guru"
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-turmeric/35 bg-charcoal px-4 py-2 text-sm font-semibold text-ivory transition hover:border-saffron hover:text-saffron disabled:cursor-wait disabled:opacity-70"
                          />
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-turmeric/16 bg-obsidian p-6 text-ivory/70">
                <ChefHat className="text-saffron" size={24} />
                <p className="mt-4">Choose at least three preferences to see live catalog recommendations.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
