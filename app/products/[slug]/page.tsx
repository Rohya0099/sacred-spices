import { notFound } from "next/navigation";
import Link from "next/link";
import { Flame, Heart, Leaf, Sparkles, Star } from "lucide-react";
import { PageShell } from "@/components/brand-shell";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductExperienceHero } from "@/components/product-experience-hero";
import { products } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { isPreorderEligible } from "@/lib/preorder";
import { productToCard } from "@/lib/product-view";
import { resolveProductImage, resolveProductImages } from "@/lib/product-images";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dbProduct = await prisma.product
    .findUnique({
      where: { slug },
      include: { category: true }
    })
    .catch(() => null);
  if (!dbProduct && process.env.NODE_ENV === "production") {
    notFound();
  }

  const staticProduct = products.find((item) => item.slug === slug);
  const dbProductImage = dbProduct
    ? resolveProductImage({
        name: dbProduct.name,
        slug: dbProduct.slug,
        category: dbProduct.category.name,
        primaryImage: dbProduct.primaryImage,
        images: dbProduct.images
      })
    : null;
  const dbProductImages = dbProduct
    ? resolveProductImages({
        name: dbProduct.name,
        slug: dbProduct.slug,
        category: dbProduct.category.name,
        primaryImage: dbProduct.primaryImage,
        images: dbProduct.images
      })
    : [];
  const product = dbProduct
    ? {
        slug: dbProduct.slug,
        name: dbProduct.name,
        category: dbProduct.category.name,
        price: Number(dbProduct.price),
        image: dbProductImage,
        images: dbProductImages,
        weight: dbProduct.weight,
        packageType: dbProduct.packageType,
        taste: dbProduct.tasteProfile.join(", "),
        spice: dbProduct.spiceLevel,
        spiceLevelLabel: dbProduct.spiceLevelLabel,
        region: dbProduct.regionalInspiration,
        story: dbProduct.emotionalStory,
        badge: dbProduct.badge,
        description: dbProduct.description,
        ingredients: dbProduct.ingredients,
        cookingRecommendations: dbProduct.cookingRecommendations,
        bestWith: dbProduct.bestWith,
        shelfLife: dbProduct.shelfLife,
        storageInstructions: dbProduct.storageInstructions,
        servesApprox: dbProduct.servesApprox,
        handcraftedNotes: dbProduct.handcraftedNotes,
        isPreorderEligible: isPreorderEligible(dbProduct)
      }
    : staticProduct
      ? {
          ...staticProduct,
          description: staticProduct.story,
          images: staticProduct.image ? [staticProduct.image] : [],
          weight: "250g",
          packageType: "Premium Pouch",
          ingredients: ["Whole spices", "Roasted aromatics", "Regional chillies"],
          cookingRecommendations: ["Dal", "Sabzi", "Gravies", "Marinades"],
          bestWith: ["Dal", "Sabzi", "Gravies"],
          shelfLife: "Best before 9 months when stored airtight.",
          storageInstructions: "Store in a cool, dry place. Use a clean, dry spoon.",
          servesApprox: "Serves family meals depending on usage.",
          spiceLevelLabel: "Medium",
          handcraftedNotes: "Prepared in small batches for freshness and aroma.",
          isPreorderEligible: false
        }
      : null;

  if (!product) {
    notFound();
  }

  if (dbProduct && !dbProduct.isActive) {
    return (
      <PageShell>
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-lg border border-turmeric/16 bg-charcoal p-8">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Product unavailable</p>
            <h1 className="mt-4 font-display text-5xl font-semibold text-ivory">{product.name}</h1>
            <p className="mt-5 text-lg leading-8 text-ivory/68">
              This product is currently unavailable.
            </p>
            <Link href="/products" className="mt-8 inline-flex rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-obsidian">
              Browse available products
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  const relatedDbProducts = dbProduct
    ? await prisma.product
        .findMany({
          where: {
            id: { not: dbProduct.id },
            inventory: { gt: 0 }
          },
          include: { category: true },
          orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
          take: 12
        })
        .catch(() => [])
    : [];
  const related = relatedDbProducts
    .sort((a, b) => {
      if (a.categoryId === dbProduct?.categoryId && b.categoryId !== dbProduct?.categoryId) return -1;
      if (a.categoryId !== dbProduct?.categoryId && b.categoryId === dbProduct?.categoryId) return 1;
      return 0;
    })
    .slice(0, 4)
    .map(productToCard);

  const detailGroups = [
    ["Description", product.description, Sparkles],
    ["Highlights", [product.taste, product.region, `${product.weight} ${product.packageType}`, product.shelfLife].join(" · "), Heart],
    ["Usage", product.bestWith.length ? product.bestWith.join(", ") : product.cookingRecommendations.join(", "), Leaf],
    ["Why this product", product.handcraftedNotes, Sparkles]
  ] as const;

  return (
    <PageShell>
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
        </div>
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-start">
          <ProductExperienceHero name={product.name} category={product.category} image={product.image} images={product.images} />
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-saffron">{product.category}</p>
              <p className="text-xs font-semibold text-ivory/70">100% Vegetarian</p>
              {product.badge ? (
                <p className="inline-flex rounded-full bg-saffron px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-obsidian">
                  {product.badge}
                </p>
              ) : null}
            </div>

            <div>
              <h1 className="font-display text-5xl font-semibold leading-tight text-ivory sm:text-6xl">{product.name}</h1>
              <div className="mt-3 flex items-center gap-2 text-saffron/85" aria-label="Rated 4.8 out of 5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} className={index === 4 ? "fill-current opacity-55" : "fill-current"} />
                ))}
                <span className="ml-1 text-sm font-semibold text-ivory/62">4.8</span>
              </div>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ivory/68">{product.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-turmeric/16 bg-charcoal/80 p-4">
              <p className="text-4xl font-semibold text-saffron">Rs. {product.price}</p>
              <span className="rounded-full border border-turmeric/20 px-3 py-1 text-sm text-ivory/70">{product.weight}</span>
              <span className="rounded-full border border-turmeric/20 px-3 py-1 text-sm text-ivory/70">{product.spiceLevelLabel}</span>
              <div className="flex items-center gap-1 text-ember" aria-label={`Spice level ${product.spice} out of 5`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Flame key={index} size={18} className={index < product.spice ? "opacity-100" : "opacity-25"} />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AddToCartButton
                productId={product.slug}
                returnTo={`/products/${product.slug}`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-saffron px-5 py-3 font-semibold text-obsidian shadow-ember transition hover:bg-turmeric disabled:cursor-wait disabled:opacity-70"
              />
              <AddToCartButton
                productId={product.slug}
                action="buy"
                label="Buy now"
                returnTo={`/products/${product.slug}`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-saffron/60 px-5 py-3 font-semibold text-saffron transition hover:bg-saffron hover:text-obsidian disabled:cursor-wait disabled:opacity-70"
              />
            </div>
            <div>
              {product.isPreorderEligible ? (
                <AddToCartButton
                  productId={product.slug}
                  action="preorder"
                  label="Pre-order Now"
                  returnTo={`/products/${product.slug}`}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-turmeric/35 bg-charcoal px-5 py-3 font-semibold text-ivory transition hover:border-saffron hover:text-saffron disabled:cursor-wait disabled:opacity-70"
                />
              ) : null}
            </div>

            <div className="grid gap-3">
              {detailGroups.map(([label, value, Icon]) => (
                <div key={label} className="rounded-lg border border-turmeric/16 bg-charcoal p-4">
                  <Icon className="text-saffron" size={16} />
                  <p className="mt-2 text-[0.68rem] uppercase tracking-[0.2em] text-ivory/45">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-ivory/72">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl text-ivory">Related products</h2>
          {related.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ivory/56">Related products are temporarily unavailable.</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
