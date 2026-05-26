type ProductImageInput = {
  name?: string | null;
  slug?: string | null;
  category?: string | null;
  primaryImage?: string | null;
  images?: string[] | null;
};

export const genericProductImage = "/images/products/generic-spice.jpg";

const keywordImageMap: Array<{ keywords: string[]; image: string }> = [
  { keywords: ["mango", "aam"], image: "/images/products/mango-pickle.jpg" },
  { keywords: ["lemon", "nimbu"], image: "/images/products/lemon-pickle.jpg" },
  { keywords: ["pickle", "achar"], image: "/images/products/mango-pickle.jpg" },
  { keywords: ["chai", "tea"], image: "/images/products/royal-chai-masala.jpg" },
  { keywords: ["turmeric", "haldi"], image: "/images/products/turmeric-powder.jpg" },
  { keywords: ["chilli", "chili", "mirchi"], image: "/images/products/red-chilli-powder.jpg" },
  { keywords: ["biryani", "biriyani"], image: "/images/products/biryani-masala.jpg" },
  { keywords: ["kolhapuri"], image: "/images/products/kolhapuri-masala.jpg" },
  { keywords: ["kitchen king"], image: "/images/products/kitchen-king-masala.jpg" },
  { keywords: ["garam"], image: "/images/products/sacred-garam-masala-1.png" },
  { keywords: ["gift", "box", "festival", "diwali"], image: "/images/products/diwali-spice-gift-box-1.png" },
  { keywords: ["masala", "spice", "spices"], image: "/images/products/spices.jpg" }
];

function preferredLocalImageForProduct(name?: string | null, slug?: string | null) {
  const value = `${name ?? ""} ${slug ?? ""}`.toLowerCase();
  if (value.includes("kitchen-king") || value.includes("kitchen king")) return "/images/products/kitchen-king-masala.jpg";
  if (value.includes("garam-masala") || value.includes("garam masala")) return "/images/products/sacred-garam-masala-1.png";
  if (value.includes("diwali-spice-gift-box") || value.includes("diwali") || value.includes("gift box")) return "/images/products/diwali-spice-gift-box-1.png";
  return null;
}

export function defaultProductImageForName(name?: string | null, category?: string | null, slug?: string | null) {
  const value = `${name ?? ""} ${category ?? ""} ${slug ?? ""}`.toLowerCase();
  const match = keywordImageMap.find((item) => item.keywords.some((keyword) => value.includes(keyword)));
  return match?.image ?? genericProductImage;
}

export function resolveProductImage(product: ProductImageInput) {
  const preferredLocalImage = preferredLocalImageForProduct(product.name, product.slug);
  if (preferredLocalImage) return preferredLocalImage;

  const primaryImage = product.primaryImage?.trim();
  if (primaryImage) return primaryImage;

  const galleryImage = product.images?.find((image) => image.trim())?.trim();
  if (galleryImage) return galleryImage;

  return defaultProductImageForName(product.name, product.category, product.slug);
}

export function resolveProductImages(product: ProductImageInput) {
  const preferredLocalImage = preferredLocalImageForProduct(product.name, product.slug);
  const existing = Array.from(new Set([product.primaryImage, ...(product.images ?? [])].filter(Boolean))) as string[];
  if (preferredLocalImage) return Array.from(new Set([preferredLocalImage, ...existing]));
  return existing.length ? existing : [defaultProductImageForName(product.name, product.category, product.slug)];
}
