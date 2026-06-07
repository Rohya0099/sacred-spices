import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const staticRoutes = [
  "",
  "/products",
  "/about",
  "/contact",
  "/community",
  "/taste-guru",
  "/shipping-policy",
  "/refund-policy",
  "/privacy-policy",
  "/terms",
  "/legal",
  "/fssai-license"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await prisma.product
    .findMany({
      where: { inventory: { gt: 0 }, isActive: true },
      select: { slug: true, updatedAt: true }
    })
    .catch(() => []);

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: route === "" || route === "/products" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.6
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
