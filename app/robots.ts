import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/api",
        "/api/",
        "/account",
        "/account/",
        "/cart",
        "/cart/",
        "/checkout",
        "/checkout/",
        "/orders",
        "/orders/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/dashboard",
        "/dashboard/"
      ]
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
