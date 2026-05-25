import type { Category, Product } from "@prisma/client";
import type { ProductCardData } from "@/components/product-card";
import { isPreorderEligible } from "@/lib/preorder";
import { resolveProductImage } from "@/lib/product-images";

export type ProductWithCategory = Product & { category: Category };

export function productToCard(product: ProductWithCategory): ProductCardData {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category.name,
    price: Number(product.price),
    image: resolveProductImage({
      name: product.name,
      slug: product.slug,
      category: product.category.name,
      primaryImage: product.primaryImage,
      images: product.images
    }),
    weight: product.weight,
    spiceLevelLabel: product.spiceLevelLabel,
    inventory: product.inventory,
    taste: product.tasteProfile.join(", "),
    spice: product.spiceLevel,
    story: product.emotionalStory,
    badge: product.badge,
    isPreorderEligible: isPreorderEligible(product)
  };
}
