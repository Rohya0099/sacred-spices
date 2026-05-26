"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clipboard, Printer, Save } from "lucide-react";
import { csrfFetch } from "@/lib/client-security";

type AdminOrder = {
  id: string;
  trackingCode: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string | Date;
  isPreorder: boolean;
  adminNote?: string | null;
  razorpayPaymentId?: string | null;
  address: Record<string, unknown>;
  user?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  items: Array<{ id: string; quantity: number; unitPrice: number; product: { name: string; slug: string } }>;
};

const orderStatuses = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export function AdminOrderDetail({ initialOrder }: { initialOrder: AdminOrder }) {
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState(initialOrder.status);
  const [message, setMessage] = useState("Ready");

  async function copyOrderId() {
    await navigator.clipboard.writeText(order.trackingCode);
    setMessage("Order ID copied.");
  }

  async function updateStatus() {
    setMessage("Updating status...");
    const response = await csrfFetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    const json = await response.json();
    if (!response.ok) {
      setMessage(json.error ?? "Could not update status.");
      return;
    }
    setOrder(json.order);
    setStatus(json.order.status);
    setMessage("Status updated.");
  }

  return (
    <main className="min-h-screen bg-[#f6f2ea] px-4 py-6 text-[#1f1a16] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin#orders" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold shadow-sm">
            <ArrowLeft size={16} />
            Admin
          </Link>
          <div className="flex gap-2">
            <button onClick={copyOrderId} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold shadow-sm">
              <Clipboard size={16} />
              Copy ID
            </button>
            <Link href={`/admin/orders/${order.id}/invoice`} className="inline-flex items-center gap-2 rounded-full bg-[#1f1a16] px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <Printer size={16} />
              Invoice
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-black/48">Order #{order.trackingCode}</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{order.user?.name ?? stringValue(order.address.name) ?? "Guest customer"}</h1>
              <p className="mt-2 text-sm text-black/52">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-6">
            <Panel title="Customer">
              <div className="grid gap-2 text-sm text-black/62">
                <p>{order.user?.name ?? stringValue(order.address.name) ?? "Name unavailable"}</p>
                <p>{order.user?.email ?? "Email unavailable"}</p>
                <p>{order.user?.phone ?? stringValue(order.address.phone) ?? "Phone unavailable"}</p>
                <p>{formatAddress(order.address)}</p>
              </div>
            </Panel>

            <Panel title="Products">
              <div className="grid gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 p-4">
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="mt-1 text-sm text-black/48">Qty {item.quantity}</p>
                    </div>
                    <p className="font-semibold">Rs. {(item.unitPrice * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <aside className="grid gap-6 self-start">
            <Panel title="Status flow">
              <div className="grid gap-2">
                {orderStatuses.map((item) => (
                  <div key={item} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${item === order.status ? "bg-emerald-50 text-emerald-800" : "bg-black/[0.03] text-black/48"}`}>
                    <CheckCircle2 size={15} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="field bg-white text-[#1f1a16]">
                  {orderStatuses.map((item) => <option key={item}>{item}</option>)}
                </select>
                <button onClick={updateStatus} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f1a16] px-4 py-3 text-sm font-semibold text-white">
                  <Save size={16} />
                  Update status
                </button>
              </div>
              <p className="mt-4 rounded-xl bg-black/[0.03] px-3 py-2 text-sm text-black/52">{message}</p>
            </Panel>

            <Panel title="Amount">
              <div className="grid gap-2 text-sm">
                <Row label="Subtotal" value={`Rs. ${order.subtotal.toLocaleString("en-IN")}`} />
                <Row label="Discount" value={`Rs. ${order.discount.toLocaleString("en-IN")}`} />
                <Row label="Shipping" value={`Rs. ${order.shipping.toLocaleString("en-IN")}`} />
                <Row label="Total" value={`Rs. ${order.total.toLocaleString("en-IN")}`} strong />
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{status}</span>;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-black/10 pt-3 text-lg font-semibold" : "text-black/62"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function formatAddress(address: Record<string, unknown>) {
  return [address.line1, address.line2, address.city, address.state, address.pincode].map(stringValue).filter(Boolean).join(", ") || "Address unavailable";
}
