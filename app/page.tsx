import type { Metadata } from "next";
import { PageShell } from "@/components/brand-shell";
import { LandingExperience } from "@/components/landing-experience";
import { prisma } from "@/lib/prisma";
import { productToCard } from "@/lib/product-view";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Sacred Spices | Authentic Indian Masalas, Pickles & Chai Blends",
  description: "Shop authentic Indian masalas, spice blends, pickles, chai masala, biryani masala, turmeric powder, chilli powder, and traditional flavours from Sacred Spices.",
  path: "/",
  titleAbsolute: true
});

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  const products = await prisma.product
    .findMany({
      where: { inventory: { gt: 0 }, isActive: true },
      include: { category: true },
      orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
      take: 3
    })
    .catch(() => []);

  return products.map(productToCard);
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <PageShell>
      <LandingExperience featuredProducts={featuredProducts} />
    </PageShell>
  );
}
