import { notFound } from "next/navigation";
import Link from "next/link";
import { Flame, Heart, Leaf, Sparkles } from "lucide-react";
import { PageShell } from "@/components/brand-shell";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FssaiTrustNote } from "@/components/fssai-trust-note";
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

  const detailCards = [
    ["Taste profile", product.taste, Sparkles],
    ["Regional inspiration", product.region, Leaf],
    ["Best with", product.bestWith.length ? product.bestWith.join(", ") : product.cookingRecommendations.join(", "), Heart],
    ["Package", `${product.weight} in ${product.packageType}`, Sparkles],
    ["Shelf life", product.shelfLife, Sparkles],
    ["Storage", product.storageInstructions, Leaf],
    ["Ingredients", product.ingredients.join(", "), Leaf],
    ["Serves approx.", product.servesApprox, Heart]
  ] as const;

  const categoryCopy = product.category.toLowerCase().includes("pickle")
    ? "Oil level may naturally vary in handcrafted batches."
    : product.name.toLowerCase().includes("chai")
      ? "Made for slow evenings and warm conversations."
      : "Slow-roasted for deeper aroma and flavor.";

  return (
    <PageShell>
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
        </div>
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.88fr_1fr] lg:items-start">
          <ProductExperienceHero name={product.name} category={product.category} image={product.image} images={product.images} />
          <div className="lg:max-h-[calc(100vh-12rem)] lg:overflow-hidden">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-saffron">{product.category}</p>
              {product.badge ? (
                <p className="inline-flex rounded-full bg-saffron px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-obsidian">
                  {product.badge}
                </p>
              ) : null}
            </div>

            <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-ivory sm:text-6xl">{product.name}</h1>
            <p className="mt-3 text-base leading-7 text-ivory/72">{product.story}</p>
            <p className="mt-2 text-sm leading-6 text-ivory/56">{product.description}</p>
            <p className="mt-3 text-sm font-semibold text-saffron/90">Move closer to the aroma - crafted in small batches.</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-turmeric/16 bg-charcoal/80 p-3">
              <p className="text-4xl font-semibold text-saffron">Rs. {product.price}</p>
              <span className="rounded-full border border-turmeric/20 px-3 py-1 text-sm text-ivory/70">{product.weight}</span>
              <span className="rounded-full border border-turmeric/20 px-3 py-1 text-sm text-ivory/70">{product.spiceLevelLabel}</span>
              <div className="flex items-center gap-1 text-ember" aria-label={`Spice level ${product.spice} out of 5`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Flame key={index} size={18} className={index < product.spice ? "opacity-100" : "opacity-25"} />
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <AddToCartButton
                productId={product.slug}
                returnTo={`/products/${product.slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-saffron px-5 py-3 font-semibold text-obsidian shadow-ember transition hover:bg-turmeric disabled:cursor-wait disabled:opacity-70 sm:w-auto"
              />
              <AddToCartButton
                productId={product.slug}
                action="buy"
                label="Buy now"
                returnTo={`/products/${product.slug}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-saffron/60 px-5 py-3 font-semibold text-saffron transition hover:bg-saffron hover:text-obsidian disabled:cursor-wait disabled:opacity-70 sm:w-auto"
              />
              {product.isPreorderEligible ? (
                <AddToCartButton
                  productId={product.slug}
                  action="preorder"
                  label="Pre-order Now"
                  returnTo={`/products/${product.slug}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-turmeric/35 bg-charcoal px-5 py-3 font-semibold text-ivory transition hover:border-saffron hover:text-saffron disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                />
              ) : null}
            </div>

            <div className="mt-4 rounded-lg border border-saffron/20 bg-saffron/10 p-3 text-sm leading-6 text-ivory/76">
              <strong className="text-saffron">Strong kitchen fit:</strong> best for {product.cookingRecommendations.join(", ")} with a {product.taste.toLowerCase()} profile.
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {["Small batch", "No preservatives", "Secure Razorpay payment"].map((item) => (
                <p key={item} className="rounded-lg border border-turmeric/16 bg-charcoal px-3 py-2 text-xs font-semibold text-ivory/70">{item}</p>
              ))}
            </div>
            <p className="mt-3 rounded-lg border border-turmeric/16 bg-charcoal p-3 text-sm leading-6 text-ivory/68">
              {product.handcraftedNotes} {categoryCopy}
            </p>

            <div className="mt-3">
              <FssaiTrustNote compact />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {detailCards.map(([label, value, Icon]) => (
                <div key={label} className="rounded-lg border border-turmeric/16 bg-charcoal p-3">
                  <Icon className="text-saffron" size={16} />
                  <p className="mt-2 text-[0.68rem] uppercase tracking-[0.2em] text-ivory/45">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-ivory/76">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
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
