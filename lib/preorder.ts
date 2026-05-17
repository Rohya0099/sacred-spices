import { businessInfo } from "@/lib/business-info";

export type PreorderProductLike = {
  slug?: string | null;
  inventory?: number | null;
  badge?: string | null;
  category?: { name?: string | null } | null;
};

export type PreorderCartItemLike = {
  product?: PreorderProductLike | null;
};

export function isPreorderEligible(product?: PreorderProductLike | null) {
  if (!product) return false;
  const badge = product.badge?.toLowerCase() ?? "";
  const category = product.category?.name?.toLowerCase() ?? "";
  return (product.inventory ?? 0) <= 0 || badge.includes("festival") || badge.includes("limited") || category.includes("festival");
}

export function getPreorderMessage(product?: PreorderProductLike | null) {
  if (product && !isPreorderEligible(product)) {
    return "This product is available for normal checkout.";
  }
  return businessInfo.preorderShippingText;
}

export function shouldCreatePreorderFromCheckout(cartItems: PreorderCartItemLike[], preorderSlug?: string | null) {
  if (!cartItems.length) return false;

  if (preorderSlug) {
    const targetItem = cartItems.find((item) => item.product?.slug === preorderSlug);
    if (!targetItem) return false;
    if (!isPreorderEligible(targetItem.product)) return false;
    return cartItems.length === 1 || cartItems.every((item) => isPreorderEligible(item.product));
  }

  return cartItems.every((item) => isPreorderEligible(item.product));
}
