import type { Metadata } from "next";
import { PageShell } from "@/components/brand-shell";
import { ProductCard } from "@/components/product-card";
import { Breadcrumb } from "@/components/breadcrumb";
import { prisma } from "@/lib/prisma";
import { products as staticProducts } from "@/lib/data";
import { productToCard } from "@/lib/product-view";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

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
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Products</p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-ivory sm:text-6xl">Explore Sacred Flavors</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ivory/68">
            Premium masalas, pickles, blends, and festive boxes with clear actions to add to cart or buy now.
          </p>
          {products.length ? (
            <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-lg border border-turmeric/16 bg-charcoal p-8 text-center text-ivory/68">
              Products are temporarily unavailable. Please try again soon.
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
