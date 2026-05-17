"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Boxes, Download, FileText, PackageCheck, Plus, Save, Trash2, Users } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { ProductCard } from "@/components/product-card";
import { csrfFetch } from "@/lib/client-security";

type Category = { id: string; name: string };
type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  emotionalStory: string;
  ingredients: string[];
  tasteProfile: string[];
  regionalInspiration: string;
  cookingRecommendations: string[];
  shelfLife: string;
  spiceLevel: number;
  price: number;
  inventory: number;
  primaryImage: string;
  images: string[];
  weight: string;
  packageType: string;
  storageInstructions: string;
  spiceLevelLabel: string;
  bestWith: string[];
  servesApprox: string;
  handcraftedNotes: string;
  badge?: string | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  category?: Category;
};
type OrderAddress = { name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
type Order = {
  id: string;
  trackingCode: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  isPreorder: boolean;
  adminNote?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  address: OrderAddress;
  user?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  items: Array<{ quantity: number; unitPrice: number; product: { name: string } }>;
};

const orderStatuses = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  emotionalStory: "",
  ingredients: "",
  tasteProfile: "",
  regionalInspiration: "",
  cookingRecommendations: "",
  shelfLife: "Best before 9 months when stored airtight.",
  spiceLevel: 3,
  price: 399,
  inventory: 10,
  primaryImage: "",
  images: "",
  weight: "250g",
  packageType: "Premium Pouch",
  storageInstructions: "Store in a cool, dry place. Use a clean, dry spoon.",
  spiceLevelLabel: "Medium",
  bestWith: "",
  servesApprox: "Serves 12-16 portions depending on usage.",
  handcraftedNotes: "Prepared in small batches for freshness and aroma.",
  badge: "",
  isFeatured: false,
  isBestSeller: false
};

function parseCsvInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function productPayloadFromForm(form: typeof emptyProduct, categoryId: string, imageUrls: string[]) {
  const typedImages = parseCsvInput(form.images);
  const images = imageUrls.length ? imageUrls : typedImages;
  const primaryImage = imageUrls[0] || form.primaryImage.trim() || images[0] || `/images/products/${form.slug.trim() || "mango-pickle"}.jpg`;

  return {
    categoryId,
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    emotionalStory: form.emotionalStory.trim(),
    ingredients: parseCsvInput(form.ingredients),
    tasteProfile: parseCsvInput(form.tasteProfile),
    regionalInspiration: form.regionalInspiration.trim(),
    cookingRecommendations: parseCsvInput(form.cookingRecommendations),
    shelfLife: form.shelfLife.trim(),
    spiceLevel: Number(form.spiceLevel),
    price: Number(form.price),
    inventory: Number(form.inventory),
    primaryImage,
    images,
    weight: form.weight.trim(),
    packageType: form.packageType.trim(),
    storageInstructions: form.storageInstructions.trim(),
    spiceLevelLabel: form.spiceLevelLabel.trim(),
    bestWith: parseCsvInput(form.bestWith),
    servesApprox: form.servesApprox.trim(),
    handcraftedNotes: form.handcraftedNotes.trim(),
    badge: form.badge.trim() || null,
    isFeatured: Boolean(form.isFeatured),
    isBestSeller: Boolean(form.isBestSeller)
  };
}

function productErrorMessage(json: { error?: string; fieldErrors?: Record<string, string[]>; issues?: { fieldErrors?: Record<string, string[]> } }) {
  const fieldErrors = json.fieldErrors ?? json.issues?.fieldErrors;
  const firstField = fieldErrors ? Object.keys(fieldErrors).find((key) => fieldErrors[key]?.length) : null;
  if (firstField) return `${firstField}: ${fieldErrors?.[firstField]?.[0]}`;
  return json.error ?? "Could not save product.";
}

export function AdminConsole() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(emptyProduct);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading admin data...");
  const [marketing, setMarketing] = useState("");
  const [marketingLoading, setMarketingLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  async function load() {
    setMessage("Loading admin data...");
    const [productRes, categoryRes, orderRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
      fetch(`/api/admin/orders${statusFilter ? `?status=${statusFilter}` : ""}`)
    ]);
    const [productJson, categoryJson, orderJson] = await Promise.all([productRes.json(), categoryRes.json(), orderRes.json()]);
    const loadedOrders = orderJson.orders ?? [];
    setProducts(productJson.products ?? []);
    setCategories(categoryJson.categories ?? []);
    setOrders(loadedOrders);
    setNoteDrafts(Object.fromEntries(loadedOrders.map((order: Order) => [order.id, order.adminNote ?? ""])));
    setCategoryId(categoryJson.categories?.[0]?.id ?? "");
    setMessage(productRes.ok && orderRes.ok ? "Admin data ready." : orderJson.error ?? "Could not load admin data.");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);

  async function saveProduct() {
    setMessage("Saving product...");
    const payload = productPayloadFromForm(form, categoryId, imageUrls);
    const response = await csrfFetch(editingId ? `/api/products/${editingId}` : "/api/products", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    setMessage(response.ok ? "Product saved." : productErrorMessage(json));
    if (response.ok) {
      setEditingId(null);
      setForm(emptyProduct);
      setImageUrls([]);
      await load();
    }
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setCategoryId(product.categoryId);
    setImageUrls(product.images);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      emotionalStory: product.emotionalStory,
      ingredients: product.ingredients.join(", "),
      tasteProfile: product.tasteProfile.join(", "),
      regionalInspiration: product.regionalInspiration,
      cookingRecommendations: product.cookingRecommendations.join(", "),
      shelfLife: product.shelfLife,
      spiceLevel: product.spiceLevel,
      price: product.price,
      inventory: product.inventory,
      primaryImage: product.primaryImage,
      images: product.images.join(", "),
      weight: product.weight,
      packageType: product.packageType,
      storageInstructions: product.storageInstructions,
      spiceLevelLabel: product.spiceLevelLabel,
      bestWith: product.bestWith.join(", "),
      servesApprox: product.servesApprox,
      handcraftedNotes: product.handcraftedNotes,
      badge: product.badge ?? "",
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller
    });
  }

  async function deleteProduct(id: string) {
    setMessage("Deleting product...");
    const response = await csrfFetch(`/api/products/${id}`, { method: "DELETE" });
    setMessage(response.ok ? "Product deleted." : "Could not delete product.");
    await load();
  }

  async function updateOrder(id: string, status: string) {
    setMessage("Updating order...");
    const response = await csrfFetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    const json = await response.json();
    setMessage(response.ok ? "Order updated." : json.error ?? "Could not update order.");
    await load();
  }

  async function saveOrderNote(id: string) {
    setMessage("Saving internal note...");
    const response = await csrfFetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ adminNote: noteDrafts[id] ?? "" })
    });
    const json = await response.json();
    setMessage(response.ok ? "Internal note saved." : json.error ?? "Could not save note.");
    await load();
  }

  async function generateMarketing(formData: FormData) {
    setMarketingLoading(true);
    const response = await csrfFetch("/api/marketing", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const json = await response.json();
    setMarketing(json.content ?? json.error ?? "No content generated.");
    setMarketingLoading(false);
  }

  function downloadMarketing() {
    const blob = new Blob([marketing], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sacred-spices-marketing.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Admin operations</p>
        <h1 className="mt-4 font-display text-6xl font-semibold text-ivory">Admin Dashboard</h1>
        <p className="mt-4 rounded-lg border border-turmeric/16 bg-charcoal px-4 py-3 text-sm text-ivory/70">{message}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Metric icon={BarChart3} label="Visible revenue" value={`Rs. ${revenue.toLocaleString("en-IN")}`} />
          <Metric icon={PackageCheck} label="Products" value={String(products.length)} />
          <Metric icon={Users} label="Orders" value={String(orders.length)} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
            <div className="flex items-center gap-3">
              <Plus className="text-saffron" />
              <h2 className="font-display text-3xl text-ivory">{editingId ? "Edit product" : "Create product"}</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="field">
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {Object.keys(emptyProduct).map((key) =>
                key === "isFeatured" || key === "isBestSeller" ? (
                  <label key={key} className="flex items-center gap-2 text-sm text-ivory/70">
                    <input type="checkbox" checked={Boolean(form[key as keyof typeof form])} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))} />
                    {key}
                  </label>
                ) : (
                  <input key={key} value={String(form[key as keyof typeof form])} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} placeholder={key} className="field" />
                )
              )}
              <ImageUpload scope="product" value={imageUrls} onChange={setImageUrls} />
              <p className="text-xs leading-5 text-ivory/50">First image is used as the primary product image. Prefer local product images or uploaded Cloudinary images with the same premium background style.</p>
              <div className="rounded-lg border border-turmeric/16 bg-obsidian p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ivory/45">Product card preview</p>
                <ProductCard
                  product={{
                    slug: form.slug || "preview",
                    name: form.name || "Product preview",
                    category: categories.find((item) => item.id === categoryId)?.name ?? "Product",
                    price: Number(form.price) || 0,
                    image: imageUrls[0] || form.primaryImage || null,
                    weight: form.weight,
                    spiceLevelLabel: form.spiceLevelLabel,
                    inventory: Number(form.inventory) || 0,
                    taste: form.tasteProfile,
                    spice: Number(form.spiceLevel) || 3,
                    story: form.emotionalStory || "Premium small-batch product preview.",
                    badge: form.badge || null
                  }}
                />
              </div>
              <button onClick={saveProduct} className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-5 py-3 font-semibold text-obsidian">
                <Save size={17} />
                {editingId ? "Update product" : "Create product"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
            <div className="flex items-center gap-3">
              <Boxes className="text-saffron" />
              <h2 className="font-display text-3xl text-ivory">Products and inventory</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {products.map((product) => (
                <div key={product.id} className="grid gap-3 rounded-lg border border-turmeric/10 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <p className="font-semibold text-ivory">{product.name}</p>
                    <p className="text-sm text-ivory/50">Rs. {product.price} · Stock {product.inventory}</p>
                  </div>
                  <button onClick={() => editProduct(product)} className="rounded-full border border-turmeric/20 px-4 py-2 text-sm text-saffron">Edit</button>
                  <button onClick={() => deleteProduct(product.id)} className="inline-flex items-center gap-2 rounded-full border border-rose/40 px-4 py-2 text-sm text-ivory">
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-turmeric/16 bg-charcoal p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-3xl text-ivory">Order management</h2>
            <div className="flex flex-wrap gap-3">
              <ExportLink href="/api/admin/exports/orders" label="Orders CSV" />
              <ExportLink href="/api/admin/exports/customers" label="Customers CSV" />
              <ExportLink href="/api/admin/exports/product-sales" label="Product sales CSV" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field sm:w-56">
                <option value="">All statuses</option>
                {orderStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {orders.length === 0 ? <p className="text-sm text-ivory/56">No orders match this filter.</p> : null}
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-turmeric/10 p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold text-ivory">#{order.trackingCode}</p>
                    <p className="text-sm text-ivory/54">
                      Rs. {order.total} · {order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")}
                      {order.isPreorder ? " · Preorder" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className="rounded-full border border-turmeric/20 px-4 py-2 text-sm text-saffron">
                      {expandedOrderId === order.id ? "Hide details" : "View details"}
                    </button>
                    <Link href={`/admin/orders/${order.id}/invoice`} className="inline-flex items-center gap-2 rounded-full border border-turmeric/20 px-4 py-2 text-sm text-saffron">
                      <FileText size={15} />
                      Print Invoice
                    </Link>
                    <select value={order.status} onChange={(event) => updateOrder(order.id, event.target.value)} className="field md:w-44">
                      {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                </div>
                {expandedOrderId === order.id ? (
                  <OrderDetails
                    order={order}
                    noteDraft={noteDrafts[order.id] ?? ""}
                    onNoteChange={(value) => setNoteDrafts((current) => ({ ...current, [order.id]: value }))}
                    onSaveNote={() => saveOrderNote(order.id)}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-turmeric/16 bg-charcoal p-6">
          <h2 className="font-display text-3xl text-ivory">AI Marketing Generator</h2>
          <form action={generateMarketing} className="mt-5 grid gap-3 md:grid-cols-3">
            <select name="channel" className="field">
              <option value="instagram">Instagram caption</option>
              <option value="ad">Ad copy</option>
              <option value="whatsapp">WhatsApp message</option>
              <option value="festival">Festival campaign</option>
              <option value="story">Product story</option>
              <option value="email">Email copy</option>
            </select>
            <input name="productName" placeholder="Product name" className="field" required />
            <input name="campaignMood" placeholder="Campaign mood" className="field" />
            <button className="rounded-full bg-saffron px-5 py-3 font-semibold text-obsidian md:col-span-3">{marketingLoading ? "Generating..." : "Generate and save"}</button>
          </form>
          {marketing ? (
            <div className="mt-5 rounded-lg border border-turmeric/12 bg-obsidian p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-ivory/72">{marketing}</p>
              <div className="mt-4 flex gap-3">
                <button onClick={() => navigator.clipboard.writeText(marketing)} className="rounded-full border border-turmeric/20 px-4 py-2 text-sm text-saffron">Copy</button>
                <button onClick={downloadMarketing} className="inline-flex items-center gap-2 rounded-full border border-turmeric/20 px-4 py-2 text-sm text-saffron">
                  <Download size={15} />
                  Download
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
      <Icon className="text-saffron" size={24} />
      <p className="mt-6 text-sm uppercase tracking-[0.22em] text-ivory/45">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ivory">{value}</p>
    </div>
  );
}

function ExportLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-2 rounded-full border border-turmeric/20 px-4 py-2 text-sm text-saffron">
      <Download size={15} />
      {label}
    </a>
  );
}

function formatAddress(address: OrderAddress) {
  return [address.name, address.phone, address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(", ") || "Address unavailable";
}

function OrderDetails({ order, noteDraft, onNoteChange, onSaveNote }: { order: Order; noteDraft: string; onNoteChange: (value: string) => void; onSaveNote: () => void }) {
  return (
    <div className="mt-5 grid gap-5 border-t border-turmeric/10 pt-5 text-sm">
      <div className="grid gap-4 lg:grid-cols-3">
        <DetailBlock title="Customer" lines={[order.user?.name ?? order.address.name ?? "Name unavailable", order.user?.email ?? "Email unavailable", order.user?.phone ?? order.address.phone ?? "Phone unavailable"]} />
        <DetailBlock title="Address" lines={[formatAddress(order.address)]} />
        <DetailBlock
          title="Order"
          lines={[
            `Created: ${new Date(order.createdAt).toLocaleString("en-IN")}`,
            `Status: ${order.status}`,
            `Preorder: ${order.isPreorder ? "Yes" : "No"}`,
            `Payment: ${order.razorpayPaymentId ? "Paid" : "Awaiting payment"}`,
            `Razorpay order: ${order.razorpayOrderId ?? "Not created"}`,
            `Razorpay payment: ${order.razorpayPaymentId ?? "Not paid"}`
          ]}
        />
      </div>
      <div className="rounded-lg border border-turmeric/10 bg-obsidian p-4">
        <p className="font-semibold text-ivory">Items</p>
        <div className="mt-3 grid gap-2">
          {order.items.map((item) => (
            <div key={`${order.id}-${item.product.name}`} className="flex flex-wrap justify-between gap-3 text-ivory/64">
              <span>{item.product.name} · Qty {item.quantity}</span>
              <span>Rs. {item.unitPrice.toLocaleString("en-IN")} each</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-1 border-t border-turmeric/10 pt-4 text-ivory/70">
          <div className="flex justify-between"><span>Subtotal</span><span>Rs. {order.subtotal.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>Rs. {order.discount.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>Rs. {order.shipping.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between font-semibold text-saffron"><span>Total</span><span>Rs. {order.total.toLocaleString("en-IN")}</span></div>
        </div>
      </div>
      <div className="rounded-lg border border-turmeric/10 bg-obsidian p-4">
        <label className="grid gap-2 text-sm text-ivory/72">
          Internal admin note
          <textarea value={noteDraft} onChange={(event) => onNoteChange(event.target.value)} className="field min-h-28" placeholder="Customer preference, delivery issue, follow-up reminder, packaging note..." />
        </label>
        <button onClick={onSaveNote} className="mt-3 rounded-full bg-saffron px-5 py-2 text-sm font-semibold text-obsidian">
          Save note
        </button>
      </div>
    </div>
  );
}

function DetailBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-turmeric/10 bg-obsidian p-4">
      <p className="font-semibold text-ivory">{title}</p>
      <div className="mt-2 grid gap-1 text-ivory/64">
        {lines.map((line) => <p key={line}>{line}</p>)}
      </div>
    </div>
  );
}
