import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Home, PackageCheck, Sparkles, UserRound } from "lucide-react";
import { PageShell } from "@/components/brand-shell";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Customer Account",
  description: "Manage your Sacred Spices profile, orders, wishlist, addresses, and Indian spice preferences.",
  path: "/account",
  noIndex: true
});

function formatAddress(address: unknown) {
  if (!address || typeof address !== "object") return "Saved address unavailable";
  const value = address as Record<string, unknown>;
  return [value.line1, value.line2, value.city, value.state, value.pincode].filter(Boolean).join(", ");
}

export default async function AccountPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/account");
  if (session.role === "ADMIN") redirect("/admin");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      customer: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { items: { include: { product: true } } }
      },
      wishlist: { include: { items: { include: { product: true } } } },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 3 }
    }
  });

  if (!user) redirect("/login");

  const orderAddresses = user.orders.map((order) => order.address);
  const storedAddresses = Array.isArray(user.customer?.addresses) ? user.customer.addresses : [];
  const addresses = [...storedAddresses, ...orderAddresses].slice(0, 4);
  const wishlistItems = user.wishlist?.items ?? [];

  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Customer account</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-5xl font-semibold text-ivory sm:text-6xl">Your Sacred Spices home.</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-ivory/70">Profile, orders, addresses, wishlist, and monthly box preferences in one calm place.</p>
            </div>
            <Link href="/products/sacred-garam-masala" className="inline-flex items-center justify-center rounded-full bg-saffron px-5 py-3 font-semibold text-obsidian">
              Continue shopping
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
            <article className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
              <UserRound className="text-saffron" size={26} />
              <h2 className="mt-5 font-display text-3xl text-ivory">Profile</h2>
              <dl className="mt-5 grid gap-3 text-sm text-ivory/70">
                <div><dt className="text-ivory/42">Name</dt><dd className="mt-1 font-semibold text-ivory">{user.name ?? "Not added"}</dd></div>
                <div><dt className="text-ivory/42">Email</dt><dd className="mt-1 font-semibold text-ivory">{user.email}</dd></div>
                <div><dt className="text-ivory/42">Phone</dt><dd className="mt-1 font-semibold text-ivory">{user.phone ?? "Not added"}</dd></div>
              </dl>
            </article>

            <article className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
              <PackageCheck className="text-saffron" size={26} />
              <h2 className="mt-5 font-display text-3xl text-ivory">Order history</h2>
              <div className="mt-5 grid gap-3">
                {user.orders.length === 0 ? (
                  <p className="rounded-lg border border-turmeric/10 p-4 text-sm text-ivory/56">No orders yet. Your first kitchen ritual will appear here.</p>
                ) : (
                  user.orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.trackingCode}`} className="grid gap-2 rounded-lg border border-turmeric/10 p-4 transition hover:border-saffron/50 sm:grid-cols-[1fr_auto]">
                      <span>
                        <span className="block font-semibold text-ivory">#{order.trackingCode}</span>
                        <span className="mt-1 block text-sm text-ivory/54">{order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")}</span>
                      </span>
                      <span className="text-sm font-semibold text-saffron">Rs. {Number(order.total).toLocaleString("en-IN")} - {order.status}</span>
                    </Link>
                  ))
                )}
              </div>
            </article>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <article className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
              <Home className="text-saffron" size={26} />
              <h2 className="mt-5 font-display text-3xl text-ivory">Saved addresses</h2>
              <div className="mt-5 grid gap-3">
                {addresses.length === 0 ? <p className="text-sm text-ivory/56">No saved addresses yet. Checkout will save the next delivery address.</p> : null}
                {addresses.map((address, index) => (
                  <p key={`${formatAddress(address)}-${index}`} className="rounded-lg border border-turmeric/10 p-4 text-sm leading-6 text-ivory/68">{formatAddress(address)}</p>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
              <Heart className="text-saffron" size={26} />
              <h2 className="mt-5 font-display text-3xl text-ivory">Wishlist</h2>
              <div className="mt-5 grid gap-3">
                {wishlistItems.length === 0 ? <p className="text-sm text-ivory/56">Wishlist is empty. Save products you want to return to.</p> : null}
                {wishlistItems.slice(0, 5).map((item) => (
                  <Link key={item.id} href={`/products/${item.product.slug}`} className="rounded-lg border border-turmeric/10 p-4 text-sm font-semibold text-ivory transition hover:border-saffron/50">
                    {item.product.name}
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
              <Sparkles className="text-saffron" size={26} />
              <h2 className="mt-5 font-display text-3xl text-ivory">Subscription status</h2>
              <div className="mt-5 grid gap-3">
                {user.subscriptions.length === 0 ? (
                  <p className="text-sm text-ivory/56">Sacred Monthly Box is not active yet.</p>
                ) : (
                  user.subscriptions.map((subscription) => (
                    <div key={subscription.id} className="rounded-lg border border-turmeric/10 p-4 text-sm text-ivory/68">
                      <p className="font-semibold text-ivory">{subscription.name}</p>
                      <p className="mt-1">{subscription.status} - {subscription.region} - spice level {subscription.spicyLevel}/5</p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
