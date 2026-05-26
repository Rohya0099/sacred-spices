"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Box, Clipboard, LayoutDashboard, Package, Pause, Play, Plus, ReceiptText, Save } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { csrfFetch } from "@/lib/client-security";
import { resolveProductImage } from "@/lib/product-images";

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
  isActive: boolean;
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
  address: OrderAddress;
  user?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  items: Array<{ quantity: number; unitPrice: number; product: { name: string } }>;
};

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
  isBestSeller: false,
  isActive: true
};

function parseCsvInput(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
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
    isBestSeller: Boolean(form.isBestSeller),
    isActive: Boolean(form.isActive)
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
  const [form, setForm] = useState(emptyProduct);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading admin data...");

  async function load() {
    const [productRes, categoryRes, orderRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
      fetch("/api/admin/orders")
    ]);
    const [productJson, categoryJson, orderJson] = await Promise.all([productRes.json(), categoryRes.json(), orderRes.json()]);
    setProducts(productJson.products ?? []);
    setCategories(categoryJson.categories ?? []);
    setOrders(orderJson.orders ?? []);
    setCategoryId((current) => current || categoryJson.categories?.[0]?.id || "");
    setMessage(productRes.ok && orderRes.ok ? "Ready" : orderJson.error ?? "Could not load admin data.");
  }

  useEffect(() => {
    load();
  }, []);

  const activeProducts = useMemo(() => products.filter((product) => product.isActive).length, [products]);
  const revenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const recentOrders = orders.slice(0, 5);

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
      isBestSeller: product.isBestSeller,
      isActive: product.isActive
    });
    document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function toggleProductStatus(product: Product) {
    const nextActive = !product.isActive;
    setMessage(nextActive ? "Resuming product..." : "Pausing product...");
    const response = await csrfFetch(`/api/products/${product.id}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: nextActive })
    });
    const json = await response.json();
    setMessage(response.ok ? (nextActive ? "Product resumed." : "Product paused.") : json.error ?? "Could not update product status.");
    await load();
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea] text-[#1f1a16]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-black/10 bg-[#fffaf1] px-5 py-6 lg:block">
        <Link href="/" className="block">
          <p className="font-display text-3xl font-semibold">Sacred Spices</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-black/45">Admin</p>
        </Link>
        <nav className="mt-10 grid gap-2 text-sm font-semibold">
          <AdminNav href="#dashboard" icon={LayoutDashboard} label="Dashboard" />
          <AdminNav href="#products" icon={Package} label="Products" />
          <AdminNav href="#orders" icon={ReceiptText} label="Orders" />
        </nav>
      </aside>

      <main className="lg:pl-64">
        <div className="sticky top-0 z-30 border-b border-black/10 bg-[#f6f2ea]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-black/45">Control room</p>
              <h1 className="mt-1 text-2xl font-semibold">Admin Dashboard</h1>
            </div>
            <p className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/60 shadow-sm">{message}</p>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <section id="dashboard" className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Metric label="Orders" value={String(orders.length)} />
              <Metric label="Revenue" value={`Rs. ${revenue.toLocaleString("en-IN")}`} />
              <Metric label="Active Products" value={String(activeProducts)} />
            </div>
            <Panel title="Recent orders">
              <div className="grid gap-3">
                {recentOrders.length ? recentOrders.map((order) => <OrderCard key={order.id} order={order} compact />) : <EmptyState label="No orders yet." />}
              </div>
            </Panel>
          </section>

          <section id="products" className="grid gap-5">
            <SectionHeader title="Products" actionLabel="New product" onAction={() => {
              setEditingId(null);
              setForm(emptyProduct);
              setImageUrls([]);
              document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductAdminCard key={product.id} product={product} onEdit={() => editProduct(product)} onToggle={() => toggleProductStatus(product)} />
              ))}
            </div>
            <ProductEditor
              categories={categories}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              form={form}
              setForm={setForm}
              imageUrls={imageUrls}
              setImageUrls={setImageUrls}
              editingId={editingId}
              onSave={saveProduct}
            />
          </section>

          <section id="orders" className="grid gap-5">
            <SectionHeader title="Orders" />
            <div className="grid gap-4 md:grid-cols-2">
              {orders.length ? orders.map((order) => <OrderCard key={order.id} order={order} />) : <EmptyState label="No orders yet." />}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function AdminNav({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-black/62 transition hover:bg-black/5 hover:text-black">
      <Icon size={18} />
      {label}
    </a>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-sm text-black/48">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {actionLabel ? (
        <button onClick={onAction} className="inline-flex items-center gap-2 rounded-full bg-[#1f1a16] px-4 py-2 text-sm font-semibold text-white shadow-sm">
          <Plus size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function StatusBadge({ active, status }: { active?: boolean; status?: string }) {
  const label = status ?? (active ? "Active" : "Paused");
  const positive = active || ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"].includes(status ?? "");
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {label}
    </span>
  );
}

function ProductAdminCard({ product, onEdit, onToggle }: { product: Product; onEdit: () => void; onToggle: () => void }) {
  const image = resolveProductImage({
    name: product.name,
    slug: product.slug,
    category: product.category?.name,
    primaryImage: product.primaryImage,
    images: product.images
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] bg-[#ebe4d8]">
        <Image src={image} alt={product.name} fill className="object-cover" sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 100vw" />
      </Link>
      <div className="grid gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="mt-1 text-sm text-black/52">Rs. {product.price.toLocaleString("en-IN")}</p>
          </div>
          <StatusBadge active={product.isActive} />
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Edit</button>
          <button onClick={onToggle} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1f1a16] px-4 py-2 text-sm font-semibold text-white">
            {product.isActive ? <Pause size={15} /> : <Play size={15} />}
            {product.isActive ? "Pause" : "Resume"}
          </button>
        </div>
      </div>
    </article>
  );
}

function OrderCard({ order, compact = false }: { order: Order; compact?: boolean }) {
  async function copyOrderId(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    await navigator.clipboard.writeText(order.trackingCode);
  }

  return (
    <Link href={`/admin/orders/${order.id}`} className="block rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-black/48">#{order.trackingCode}</p>
          <h3 className="mt-1 font-semibold">{order.user?.name ?? order.address.name ?? "Guest customer"}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xl font-semibold">Rs. {order.total.toLocaleString("en-IN")}</p>
        <button onClick={copyOrderId} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-black/62">
          <Clipboard size={14} />
          Copy ID
        </button>
      </div>
      {!compact ? <p className="mt-3 line-clamp-1 text-sm text-black/48">{order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")}</p> : null}
    </Link>
  );
}

function ProductEditor({
  categories,
  categoryId,
  setCategoryId,
  form,
  setForm,
  imageUrls,
  setImageUrls,
  editingId,
  onSave
}: {
  categories: Category[];
  categoryId: string;
  setCategoryId: (value: string) => void;
  form: typeof emptyProduct;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyProduct>>;
  imageUrls: string[];
  setImageUrls: (value: string[]) => void;
  editingId: string | null;
  onSave: () => void;
}) {
  const primaryFields = ["name", "slug", "price", "inventory", "weight", "badge"] as const;
  const detailFields = ["description", "emotionalStory", "ingredients", "tasteProfile", "regionalInspiration", "cookingRecommendations", "shelfLife", "storageInstructions", "bestWith", "servesApprox", "handcraftedNotes", "images", "primaryImage"] as const;

  return (
    <div id="product-editor" className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Box size={18} />
        <h3 className="text-lg font-semibold">{editingId ? "Edit product" : "Create product"}</h3>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="field bg-white text-[#1f1a16] md:col-span-2">
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        {primaryFields.map((key) => (
          <input key={key} value={String(form[key])} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} placeholder={key} className="field bg-white text-[#1f1a16]" />
        ))}
        {detailFields.map((key) => (
          <input key={key} value={String(form[key])} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} placeholder={key} className="field bg-white text-[#1f1a16]" />
        ))}
        <input value={String(form.spiceLevel)} onChange={(event) => setForm((current) => ({ ...current, spiceLevel: Number(event.target.value) }))} placeholder="spiceLevel" className="field bg-white text-[#1f1a16]" />
        <input value={form.packageType} onChange={(event) => setForm((current) => ({ ...current, packageType: event.target.value }))} placeholder="packageType" className="field bg-white text-[#1f1a16]" />
        <input value={form.spiceLevelLabel} onChange={(event) => setForm((current) => ({ ...current, spiceLevelLabel: event.target.value }))} placeholder="spiceLevelLabel" className="field bg-white text-[#1f1a16]" />
        <label className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Active</label>
        <label className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))} /> Featured</label>
        <label className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm"><input type="checkbox" checked={form.isBestSeller} onChange={(event) => setForm((current) => ({ ...current, isBestSeller: event.target.checked }))} /> Bestseller</label>
        <div className="md:col-span-2">
          <ImageUpload scope="product" value={imageUrls} onChange={setImageUrls} />
        </div>
      </div>
      <button onClick={onSave} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1f1a16] px-5 py-3 text-sm font-semibold text-white">
        <Save size={16} />
        {editingId ? "Update product" : "Create product"}
      </button>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-black/15 p-6 text-sm text-black/48">{label}</div>;
}
