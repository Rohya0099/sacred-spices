import type { Metadata } from "next";
import { PageShell } from "@/components/brand-shell";
import { ProductCard } from "@/components/product-card";
import { Breadcrumb } from "@/components/breadcrumb";
import { prisma } from "@/lib/prisma";
import { products as staticProducts } from "@/lib/data";
import { productToCard } from "@/lib/product-view";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Shop Indian Masalas & Pickles Online",
  description: "Explore Sacred Spices products including garam masala, kitchen king masala, biryani masala, Kolhapuri masala, chai masala, turmeric powder, red chilli powder, and traditional pickles.",
  path: "/products"
});
export const dynamic = "force-dynamic";

const seoSections = [
  {
    title: "Shop Indian Masalas Online",
    body:
      "Sacred Spices brings together Indian masalas for everyday cooking, from garam masala and kitchen king masala to biryani masala and regional blends. Each product page helps you understand the flavour, spice level, best uses, ingredients, storage, and pack details before you add it to your kitchen."
  },
  {
    title: "Traditional Indian Pickles",
    body:
      "Pickles are part of daily Indian meals, festival plates, travel food, and family memories. Sacred Spices lists traditional pickles such as mango pickle and lemon pickle when available, with honest product information about taste, ingredients, pack size, and storage instead of exaggerated claims."
  },
  {
    title: "Everyday Cooking Spice Blends",
    body:
      "For dal, sabzi, gravies, snacks, rice dishes, marinades, and quick home meals, spice blends should be easy to choose and easy to use. Browse blends by taste profile, spice level, regional inspiration, and cooking recommendations so you can match the masala to the dish."
  },
  {
    title: "Chai Masala and Festival Gift Boxes",
    body:
      "Sacred Spices also supports warm kitchen rituals such as chai, gifting, and seasonal cooking. When chai masala or festival gift boxes are available, product pages explain the intended use, packaging, availability, and flavour direction so shoppers can choose with confidence."
  }
];

export default async function ProductsPage() {
  let dbFailed = false;
  const dbProducts = await prisma.product
    .findMany({
      where: { inventory: { gt: 0 }, isActive: true },
      include: { category: true },
      orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }]
    })
    .catch(() => {
      dbFailed = true;
      return [];
    });

  const products = dbFailed && process.env.NODE_ENV !== "production" ? staticProducts : dbProducts.map(productToCard);

  return (
    <PageShell>
      <section className="px-4 pb-16 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pt-14">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Products</p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-ivory sm:text-6xl">Explore Sacred Flavors</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ivory/68">
            Premium Indian food products, homemade masalas, pickles, blends, and gift boxes with clear actions to add to cart or buy now.
          </p>
          {products.length ? (
            <div className="mx-auto mt-10 grid max-w-6xl items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-lg border border-turmeric/16 bg-charcoal p-8 text-center text-ivory/68">
              Products are temporarily unavailable. Please try again soon.
            </div>
          )}
          <section className="mt-14 grid gap-5 md:grid-cols-2" aria-label="Sacred Spices product guide">
            {seoSections.map((section) => (
              <article key={section.title} className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
                <h2 className="font-display text-3xl text-ivory">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ivory/68">{section.body}</p>
              </article>
            ))}
          </section>
        </div>
      </section>
    </PageShell>
  );
}
