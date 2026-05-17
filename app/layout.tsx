import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
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
  title: {
    default: "Sacred Spices | Food Carries Energy",
    template: "%s | Sacred Spices"
  },
  description:
    "A premium AI-first Indian D2C food brand for spices, masalas, pickles, chutneys, ritual cooking, and soulful family meals.",
  keywords: ["Indian spices", "masalas", "pickles", "AI recipe recommendations", "premium food brand"],
  openGraph: {
    title: "Sacred Spices",
    description: "Every spice has a story. Every meal should feel memorable.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
