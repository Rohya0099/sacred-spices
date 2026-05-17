"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarHeart, ChefHat, CreditCard, Gift, Headphones, IndianRupee, PackageCheck, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import { categories, festivalCollections, rituals } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import type { ProductCardData } from "@/components/product-card";
import { Section } from "@/components/section";
import { fssaiDisplay } from "@/lib/business-info";

export function LandingExperience({ featuredProducts }: { featuredProducts: ProductCardData[] }) {
  const signatureBlendHref = featuredProducts[0]?.slug ? `/products/${featuredProducts[0].slug}` : "/products";

  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 spice-field opacity-80" />
        <Image
          src="https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=1800&q=85"
          alt="Premium Indian spices in warm cinematic light"
          fill
          priority
          className="object-cover opacity-42"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/72 to-obsidian/30" />
        <div className="absolute bottom-20 right-[12%] hidden h-48 w-24 rounded-full bg-ivory/10 blur-2xl steam md:block" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-3xl pb-12"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-saffron">AI-first Indian food luxury</p>
            <h1 className="mt-6 font-display text-6xl font-semibold leading-[0.95] text-ivory sm:text-7xl lg:text-8xl">
              Sacred Flavors of India
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ivory/76 sm:text-xl">
              Food carries energy. Discover masalas, pickles, chutneys, and ritual cooking guidance shaped by memory, region, and family warmth.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/taste-guru" className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-4 font-semibold text-obsidian shadow-ember transition hover:bg-turmeric">
                <Sparkles size={18} />
                Meet AI Taste Guru
              </Link>
              <Link href={signatureBlendHref} className="inline-flex items-center justify-center gap-2 rounded-full border border-turmeric/35 px-6 py-4 font-semibold text-ivory transition hover:border-saffron hover:text-saffron">
                Shop signature blends
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Section
        eyebrow="Sacred philosophy"
        title="Cooking is not a transaction. It is attention, memory, and offering."
        copy="Sacred Spices is built for people who still remember the sound of tadka, the care in a lunchbox, the fragrance of festivals, and the quiet dignity of a family recipe."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {rituals.map((ritual) => (
            <div key={ritual.title} className="rounded-lg border border-turmeric/16 bg-charcoal/80 p-6">
              <ritual.icon className="text-saffron" size={26} />
              <h3 className="mt-5 font-display text-2xl text-ivory">{ritual.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ivory/64">{ritual.copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Featured products" title="Blends with a story behind every pinch">
        {featuredProducts.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-turmeric/16 bg-charcoal p-6 text-sm text-ivory/64">
            Products are temporarily unavailable. Please try again soon.
          </div>
        )}
      </Section>

      <section className="bg-ivory px-4 py-20 text-obsidian sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose">AI Taste Guru</p>
            <h2 className="mt-4 font-display text-5xl font-semibold leading-tight">A warmer way to choose what your kitchen needs.</h2>
            <p className="mt-5 text-lg leading-8 text-obsidian/70">
              Answer a few taste questions and receive culturally aware product, recipe, combo, and subscription recommendations.
            </p>
            <Link href="/taste-guru" className="mt-8 inline-flex items-center gap-2 rounded-full bg-obsidian px-6 py-4 font-semibold text-ivory transition hover:bg-rose">
              Start recommendation
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Spicy or mild?", "Tangy or smoky?", "North or South Indian?", "Daily meal or celebration?"].map((question) => (
              <div key={question} className="rounded-lg border border-obsidian/10 bg-white p-5 shadow-sm">
                <ChefHat className="text-ember" size={22} />
                <p className="mt-5 font-display text-2xl font-semibold">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section eyebrow="Trust and care" title="Built for confidence before the first pinch">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: fssaiDisplay, copy: "Sacred Spices is in early-access small-batch launch. The registration number will appear once issued." },
            { icon: CreditCard, title: "Secure payments", copy: "Razorpay checkout with server-side payment verification and no card data stored by Sacred Spices." },
            { icon: IndianRupee, title: "Made in India", copy: "Rooted in Indian kitchens, regional memories, and practical everyday cooking." },
            { icon: Sprout, title: "Authentic sourcing", copy: "Sourcing stories are written honestly and updated only when supplier details are verified." },
            { icon: PackageCheck, title: "Small-batch quality", copy: "Small-batch production. No fake reviews. No false medical claims." },
            { icon: Headphones, title: "Customer support", copy: "Order support, delivery questions, and product guidance through launch-ready care channels." }
          ].map((item) => (
            <article key={item.title} className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
              <item.icon className="text-saffron" size={25} />
              <h3 className="mt-5 font-display text-2xl text-ivory">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ivory/64">{item.copy}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Collections" title="Seasonal, regional, and gift-ready">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {festivalCollections.map((item) => (
            <div key={item} className="rounded-lg border border-turmeric/16 bg-charcoal p-5">
              <CalendarHeart className="text-saffron" size={22} />
              <p className="mt-5 font-display text-2xl text-ivory">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Sacred Monthly Box"
        title="A subscription shaped around your family table"
        copy="Choose region, spice preference, family size, and occasion rhythm. Receive a monthly box of blends, pickles, recipes, and small rituals for better meals."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {["Spice preference", "Family size", "Region", "Spicy level"].map((item) => (
            <div key={item} className="rounded-lg border border-turmeric/16 bg-charcoal p-5">
              <Gift className="text-saffron" size={22} />
              <p className="mt-4 font-semibold text-ivory">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Customer stories"
        title="Real stories will belong here after launch"
        copy="The product deliberately avoids invented reviews. This section is ready for verified customer memories, recipe photos, and tasting notes collected with consent."
      />

      <Section eyebrow="Categories" title="Built for today, ready for tomorrow">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <span key={category} className="rounded-full border border-turmeric/25 bg-turmeric/8 px-4 py-2 text-sm text-ivory/78">
              {category}
            </span>
          ))}
          {["Tea Blends", "Brass Kitchenware", "Global Shipping", "AI Recipe Videos"].map((future) => (
            <span key={future} className="rounded-full border border-ivory/12 px-4 py-2 text-sm text-ivory/52">
              Future: {future}
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}
