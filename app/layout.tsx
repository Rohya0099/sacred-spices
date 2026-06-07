import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { businessInfo } from "@/lib/business-info";
import { absoluteUrl, defaultSeoImage, organizationSchema, siteUrl, websiteSchema } from "@/lib/seo";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sacred Spices | Authentic Indian Masalas, Pickles & Chai Blends",
    template: "%s | Sacred Spices"
  },
  description:
    "Shop authentic Indian masalas, spice blends, pickles, chai masala, biryani masala, turmeric powder, chilli powder, and traditional flavours from Sacred Spices.",
  keywords: ["Indian masalas", "Indian spices", "homemade-style masala", "pickles", "chai masala", "biryani masala"],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "Sacred Spices | Authentic Indian Masalas, Pickles & Chai Blends",
    description: "Shop authentic Indian masalas, spice blends, pickles, chai masala, biryani masala, turmeric powder, chilli powder, and traditional flavours from Sacred Spices.",
    url: siteUrl,
    siteName: businessInfo.brandName,
    images: [{ url: absoluteUrl(defaultSeoImage), width: 1200, height: 630, alt: "Sacred Spices premium Indian spices" }],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Sacred Spices | Authentic Indian Masalas, Pickles & Chai Blends",
    description: "Shop authentic Indian masalas, spice blends, pickles, chai masala, biryani masala, turmeric powder, chilli powder, and traditional flavours from Sacred Spices.",
    images: [absoluteUrl(defaultSeoImage)]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema(), websiteSchema()]) }}
        />
        {children}
      </body>
    </html>
  );
}
