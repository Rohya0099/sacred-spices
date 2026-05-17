import Link from "next/link";
import { ShoppingBag, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { FssaiTrustNote } from "@/components/fssai-trust-note";
import { businessInfo, publicCityState, supportDisplay } from "@/lib/business-info";
import { ActiveNavLinks, type NavItem } from "@/components/active-nav";

const nav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/taste-guru", label: "AI Taste Guru" },
  { href: "/community", label: "Community" },
  { href: "/orders/track", label: "Track" }
];

export async function BrandHeader() {
  const user = await getSessionUser();
  const accountNav: NavItem[] = [
    ...(user?.role === "CUSTOMER" ? [{ href: "/account", label: "Account" }] : []),
    ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
    ...(!user ? [{ href: "/login", label: "Login" }] : [])
  ];
  const mobileNav: NavItem[] = [
    ...nav,
    ...accountNav,
    { href: "/checkout", label: "Cart" }
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-turmeric/15 bg-obsidian shadow-[0_18px_60px_rgba(0,0,0,0.42)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Sacred Spices home">
          <span className="grid size-10 place-items-center rounded-full border border-turmeric/30 bg-saffron/10 text-saffron">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="block font-display text-2xl font-semibold leading-none text-ivory">{businessInfo.brandName}</span>
            <span className="block text-[11px] uppercase tracking-[0.28em] text-sandalwood">{businessInfo.tagline}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ivory/82 md:flex">
          <ActiveNavLinks items={[...nav, ...accountNav]} />
          {user ? <LogoutButton /> : null}
        </nav>
        <Link
          href="/checkout"
          className="inline-flex size-10 items-center justify-center rounded-full border border-turmeric/30 bg-turmeric/10 text-turmeric transition hover:bg-turmeric hover:text-obsidian"
          aria-label="Open cart"
        >
          <ShoppingBag size={18} />
        </Link>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-4 overflow-x-auto border-t border-turmeric/10 px-4 pb-3 text-sm font-medium text-ivory/76 sm:px-6 md:hidden">
        <ActiveNavLinks items={mobileNav} mobile />
        {user ? <LogoutButton /> : null}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-turmeric/15 bg-obsidian px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <p className="font-display text-3xl text-ivory">{businessInfo.brandName}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-ivory/64">
            Premium Indian spices, masalas, pickles, and AI-guided cooking experiences for soulful homes.
          </p>
          <p className="mt-4 text-sm leading-6 text-ivory/60">{supportDisplay()}</p>
          <p className="text-sm leading-6 text-ivory/50">{publicCityState()}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-saffron">Explore</p>
          <div className="mt-4 grid gap-2 text-sm text-ivory/68">
            <Link href="/taste-guru">AI Taste Guru</Link>
            <Link href="/community">Sacred Kitchen Community</Link>
            <Link href="/orders/track">Order Tracking</Link>
            <Link href="/account">Customer Account</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-saffron">Trust</p>
          <div className="mt-4">
            <FssaiTrustNote compact />
          </div>
          <p className="mt-4 text-sm leading-6 text-ivory/68">
            Small-batch production. No fake reviews. No false medical claims. Secure payments through Razorpay.
          </p>
          <Link href="/fssai-license" className="mt-3 inline-flex text-sm font-semibold text-saffron">FSSAI details</Link>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-saffron">Company</p>
          <div className="mt-4 grid gap-2 text-sm text-ivory/68">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/shipping-policy">Shipping Policy</Link>
            <Link href="/refund-policy">Refund Policy</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/legal">Legal</Link>
            <Link href="/fssai-license">FSSAI / License</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrandHeader />
      <main className="min-h-screen pt-32 md:pt-20">{children}</main>
      <Footer />
    </>
  );
}
