import type { Metadata } from "next";
import { businessInfo } from "@/lib/business-info";

const productionUrl = "https://sacred-spices.vercel.app";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || productionUrl;
const isLocalSiteUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredSiteUrl);

export const siteUrl = (process.env.NODE_ENV === "production" && isLocalSiteUrl ? productionUrl : configuredSiteUrl).replace(/\/$/, "");

export const defaultSeoImage = "/images/products/generic-spice.jpg";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createMetadata({ title, description, path = "/", image = defaultSeoImage, noIndex = false }: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : absoluteUrl(defaultSeoImage);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: `${title} | ${businessInfo.brandName}`,
      description,
      url,
      siteName: businessInfo.brandName,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${businessInfo.brandName} premium Indian spices` }],
      locale: "en_IN",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${businessInfo.brandName}`,
      description,
      images: [imageUrl]
    },
    robots: noIndex ? { index: false, follow: false } : undefined
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessInfo.brandName,
    url: siteUrl,
    email: businessInfo.supportEmail,
    telephone: businessInfo.supportPhone,
    address: {
      "@type": "PostalAddress",
      addressLocality: businessInfo.cityState,
      addressCountry: "IN"
    },
    sameAs: []
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: businessInfo.brandName,
    url: siteUrl,
    description: "Pure vegetarian Indian spices, homemade masalas, pickles, and premium gift boxes.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}
