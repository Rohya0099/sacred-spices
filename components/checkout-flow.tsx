"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, Minus, Plus, ShieldCheck, ShoppingCart, Tag, Trash2, Truck } from "lucide-react";
import { csrfFetch } from "@/lib/client-security";
import { FssaiTrustNote } from "@/components/fssai-trust-note";
import { businessInfo } from "@/lib/business-info";
import { shouldCreatePreorderFromCheckout } from "@/lib/preorder";
import { resolveProductImage } from "@/lib/product-images";

type CartItem = {
  productId: string;
  quantity: number;
  lineTotal: number;
  product: {
    name: string;
    slug: string;
    price: number;
    primaryImage?: string | null;
    images: string[];
    inventory: number;
    badge?: string | null;
    isActive: boolean;
  };
};

type Cart = {
  items: CartItem[];
  total: number;
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: () => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const freeShippingAt = 999;

export function CheckoutFlow() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("Loading your cart...");
  const [createdOrder, setCreatedOrder] = useState<{ id: string; trackingCode: string; total: number } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState<string | null>(null);
  const [preorderSlug, setPreorderSlug] = useState<string | null>(null);

  const shipping = cart?.total ? (cart.total > freeShippingAt ? 0 : 70) : 0;
  const estimatedTotal = (cart?.total ?? 0) + shipping;
  const itemCount = useMemo(() => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0, [cart]);
  const isPreorder = useMemo(() => shouldCreatePreorderFromCheckout(cart?.items ?? [], preorderSlug), [cart?.items, preorderSlug]);
  const hasUnavailableItem = useMemo(() => cart?.items.some((item) => !item.product.isActive) ?? false, [cart]);
  const preorderWarning = preorderSlug && cart?.items.length && !isPreorder
    ? "Pre-order checkout was requested, but this cart is not eligible for preorder. It will continue as a normal order."
    : null;

  async function loadCart() {
    const response = await fetch("/api/cart");
    const json = await response.json();
    if (response.status === 401) {
      setMessage("Please login before checkout.");
      setCart(null);
      return;
    }
    setCart(json.cart);
    setMessage(response.ok ? "Cart ready." : json.error ?? "Could not load cart.");
  }

  useEffect(() => {
    setPreorderSlug(new URLSearchParams(window.location.search).get("preorder"));
    loadCart();
  }, []);

  async function updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return removeItem(item);
    setCartLoading(item.productId);
    const response = await csrfFetch("/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: item.productId, quantity })
    });
    const json = await response.json();
    setCartLoading(null);
    if (!response.ok) {
      setMessage(json.error ?? "Could not update cart.");
      return;
    }
    setCart(json.cart);
    setMessage("Cart updated.");
  }

  async function removeItem(item: CartItem) {
    setCartLoading(item.productId);
    const response = await csrfFetch(`/api/cart?productId=${encodeURIComponent(item.productId)}`, { method: "DELETE" });
    const json = await response.json();
    setCartLoading(null);
    if (!response.ok) {
      setMessage(json.error ?? "Could not remove item.");
      return;
    }
    setCart(json.cart);
    setMessage("Item removed from cart.");
  }

  async function createOrder(formData: FormData) {
    setMessage("Creating order...");
    const address = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      line1: formData.get("line1"),
      line2: formData.get("line2") || undefined,
      city: formData.get("city"),
      state: formData.get("state"),
      pincode: formData.get("pincode")
    };
    const response = await csrfFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({ address, couponCode: couponCode || undefined, preorderSlug: preorderSlug || undefined, isPreorder })
    });
    const json = await response.json();
    if (!response.ok) {
      setMessage(json.error ?? "Could not create order.");
      return;
    }
    setCreatedOrder(json.order);
    setMessage(isPreorder ? "Pre-order created. Opening secure Razorpay checkout..." : "Order created. Opening secure Razorpay checkout...");
    await loadCart();
    await startRazorpayPayment(json.order);
  }

  async function ensureRazorpayScript() {
    if (window.Razorpay) return true;
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function markFailed(orderId: string) {
    await csrfFetch("/api/razorpay/fail", {
      method: "POST",
      body: JSON.stringify({ orderId })
    }).catch(() => null);
  }

  async function startRazorpayPayment(order: { id: string; trackingCode: string; total: number }) {
    setPaymentLoading(true);
    const scriptReady = await ensureRazorpayScript();
    if (!scriptReady || !window.Razorpay) {
      setPaymentLoading(false);
      setMessage("Could not load Razorpay Checkout. Please try again.");
      router.push("/checkout/failure");
      return;
    }

    const paymentOrderResponse = await csrfFetch("/api/razorpay/order", {
      method: "POST",
      body: JSON.stringify({ orderId: order.id })
    });
    const paymentOrder = await paymentOrderResponse.json();
    if (!paymentOrderResponse.ok) {
      setPaymentLoading(false);
      setMessage(paymentOrder.error ?? "Could not create Razorpay order.");
      return;
    }

    const razorpay = new window.Razorpay({
      key: paymentOrder.keyId,
      amount: paymentOrder.order.amount,
      currency: paymentOrder.order.currency,
      name: "Sacred Spices",
      description: `Order ${order.trackingCode}`,
      order_id: paymentOrder.order.id,
      theme: { color: "#f3a51f" },
      handler: async (response: RazorpaySuccess) => {
        const verifyResponse = await csrfFetch("/api/razorpay/verify", {
          method: "POST",
          body: JSON.stringify({
            orderId: order.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          })
        });
        const verified = await verifyResponse.json();
        setPaymentLoading(false);
        if (!verifyResponse.ok || !verified.verified) {
          await markFailed(order.id);
          router.push("/checkout/failure");
          return;
        }
        router.push(`/checkout/success?order=${verified.trackingCode}`);
      },
      modal: {
        ondismiss: async () => {
          setPaymentLoading(false);
          setMessage("Payment was not completed. You can try again from checkout.");
          await markFailed(order.id);
        }
      }
    });

    razorpay.on("payment.failed", async () => {
      setPaymentLoading(false);
      await markFailed(order.id);
      router.push("/checkout/failure");
    });

    razorpay.open();
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Cart and checkout</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-5xl font-semibold text-ivory sm:text-6xl">Your Cart</h1>
            <p className="mt-4 max-w-2xl text-ivory/64">Review items, adjust quantities, add delivery details, and complete payment securely.</p>
          </div>
          <Link href="/products/sacred-garam-masala" className="inline-flex items-center justify-center rounded-full border border-turmeric/25 px-5 py-3 text-sm font-semibold text-saffron transition hover:border-saffron">
            Continue shopping
          </Link>
        </div>

        <p className="mt-8 rounded-lg border border-turmeric/16 bg-charcoal px-4 py-3 text-sm text-ivory/68">{message}</p>
        {isPreorder ? (
          <p className="mt-4 rounded-lg border border-saffron/30 bg-saffron/10 px-4 py-3 text-sm font-semibold text-ivory">
            This is a pre-order. {businessInfo.preorderShippingText}
          </p>
        ) : null}
        {preorderWarning ? (
          <p className="mt-4 rounded-lg border border-turmeric/20 bg-charcoal px-4 py-3 text-sm text-ivory/68">
            {preorderWarning}
          </p>
        ) : null}
        <div className="mt-4">
          <FssaiTrustNote compact />
        </div>

        {message === "Please login before checkout." ? (
          <Link href="/login?next=/checkout" className="mt-5 inline-flex rounded-full bg-saffron px-5 py-3 text-sm font-semibold text-obsidian">
            Login or register to continue
          </Link>
        ) : null}

        {message !== "Please login before checkout." && cart && cart.items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-turmeric/16 bg-charcoal p-8 text-center">
            <ShoppingCart className="mx-auto text-saffron" size={36} />
            <h2 className="mt-4 font-display text-4xl text-ivory">Your cart is empty.</h2>
            <p className="mt-3 text-sm text-ivory/58">Add a blend, pickle, or gift box to begin checkout.</p>
            <Link href="/" className="mt-6 inline-flex rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-obsidian">
              Shop Sacred Spices
            </Link>
          </div>
        ) : null}

        {message === "Please login before checkout." || !cart?.items.length ? null : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="grid gap-6">
              <section className="rounded-lg border border-turmeric/16 bg-charcoal">
                <div className="flex items-center justify-between border-b border-turmeric/12 px-5 py-4">
                  <h2 className="font-display text-3xl text-ivory">Cart items</h2>
                  <span className="text-sm font-semibold text-saffron">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                </div>
                <div className="divide-y divide-turmeric/10">
                  {cart.items.map((item) => {
                    const image = resolveProductImage({
                      name: item.product.name,
                      slug: item.product.slug,
                      primaryImage: item.product.primaryImage,
                      images: item.product.images
                    });
                    return (
                      <article key={item.productId} className="grid gap-4 p-5 sm:grid-cols-[120px_1fr]">
                        <Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden rounded-lg border border-turmeric/12 bg-obsidian">
                          <Image src={image} alt={item.product.name} fill className="object-cover" sizes="120px" />
                        </Link>
                        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                          <div>
                            <Link href={`/products/${item.product.slug}`} className="font-display text-2xl font-semibold text-ivory transition hover:text-saffron">
                              {item.product.name}
                            </Link>
                            <p className="mt-2 text-sm text-ivory/54">In stock: {item.product.inventory}</p>
                            {!item.product.isActive ? <p className="mt-2 inline-flex rounded-full bg-rose/15 px-3 py-1 text-xs font-semibold text-rose">Unavailable</p> : null}
                            {item.product.badge ? <p className="mt-2 inline-flex rounded-full bg-saffron/12 px-3 py-1 text-xs font-semibold text-saffron">{item.product.badge}</p> : null}
                            <div className="mt-5 flex flex-wrap items-center gap-3">
                              <div className="inline-flex items-center overflow-hidden rounded-full border border-turmeric/20">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item, item.quantity - 1)}
                                  disabled={cartLoading === item.productId}
                                  className="grid size-10 place-items-center text-saffron transition hover:bg-saffron hover:text-obsidian disabled:opacity-50"
                                  aria-label={`Decrease ${item.product.name} quantity`}
                                >
                                  <Minus size={15} />
                                </button>
                                <span className="grid h-10 min-w-12 place-items-center border-x border-turmeric/14 px-3 text-sm font-semibold text-ivory">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item, item.quantity + 1)}
                                  disabled={cartLoading === item.productId || !item.product.isActive || item.quantity >= item.product.inventory}
                                  className="grid size-10 place-items-center text-saffron transition hover:bg-saffron hover:text-obsidian disabled:opacity-50"
                                  aria-label={`Increase ${item.product.name} quantity`}
                                >
                                  <Plus size={15} />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(item)}
                                disabled={cartLoading === item.productId}
                                className="inline-flex items-center gap-2 rounded-full border border-rose/35 px-4 py-2 text-sm font-semibold text-ivory transition hover:border-rose hover:text-rose disabled:opacity-50"
                              >
                                <Trash2 size={15} />
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-sm text-ivory/50">Rs. {item.product.price.toLocaleString("en-IN")} each</p>
                            <p className="mt-2 text-2xl font-semibold text-saffron">Rs. {item.lineTotal.toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <form action={createOrder} className="grid gap-4 rounded-lg border border-turmeric/16 bg-charcoal p-6">
                <div className="flex items-center gap-3">
                  <MapPin className="text-saffron" />
                  <h2 className="font-display text-3xl text-ivory">Delivery address</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="name" placeholder="Full name" required className="field" />
                  <input name="phone" placeholder="Phone number" required className="field" />
                  <input name="line1" placeholder="House / street / area" required className="field sm:col-span-2" />
                  <input name="line2" placeholder="Apartment, landmark (optional)" className="field sm:col-span-2" />
                  <input name="city" placeholder="City" required className="field" />
                  <input name="state" placeholder="State" required className="field" />
                  <input name="pincode" placeholder="Pincode" required className="field" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Tag className="text-saffron" />
                  <input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="field flex-1"
                  />
                </div>
                {hasUnavailableItem ? (
                  <p className="rounded-lg border border-rose/30 bg-rose/10 px-4 py-3 text-sm font-semibold text-ivory">
                    This product is currently unavailable.
                  </p>
                ) : null}
                <button disabled={hasUnavailableItem || paymentLoading} className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-6 py-4 font-semibold text-obsidian shadow-ember transition hover:bg-turmeric disabled:cursor-not-allowed disabled:opacity-60">
                  <CreditCard size={18} />
                  {paymentLoading ? "Opening payment..." : isPreorder ? "Pre-order and pay" : "Place order and pay"}
                </button>
              </form>
            </div>

            <aside className="rounded-lg border border-turmeric/16 bg-ivory p-6 text-obsidian lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-display text-4xl font-semibold">Price details</h2>
              <div className="mt-6 grid gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                  <span>Rs. {cart.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span>
                </div>
                <div className="rounded-lg bg-obsidian/5 p-3 text-xs leading-5">
                  {shipping === 0 ? "Free shipping applied." : `Add Rs. ${(freeShippingAt + 1 - cart.total).toLocaleString("en-IN")} more for free shipping.`}
                </div>
                <div className="flex justify-between border-t border-obsidian/10 pt-4 text-xl font-semibold">
                  <span>Total</span>
                  <span>Rs. {estimatedTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-obsidian/70">
                <p className="inline-flex items-center gap-2"><ShieldCheck size={17} /> Secure Razorpay payment</p>
                <p className="inline-flex items-center gap-2"><Truck size={17} /> Tracked delivery after confirmation</p>
              </div>
              {createdOrder ? (
                <Link href={`/orders/${createdOrder.trackingCode}`} className="mt-6 inline-flex w-full justify-center rounded-full border border-obsidian/20 px-5 py-3 text-sm font-semibold">
                  Track order #{createdOrder.trackingCode}
                </Link>
              ) : null}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
