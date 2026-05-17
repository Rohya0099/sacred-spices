"use client";

import { useEffect, useState } from "react";

type Order = { trackingCode: string; status: string; total: number; items: Array<{ quantity: number; product: { name: string } }> };

const steps = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
const terminalStatuses = ["CANCELLED", "REFUNDED"];

export function OrderStatusView({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("Loading order...");

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        setOrder(json.order ?? null);
        setMessage(ok ? "Order found." : json.error ?? "Order not found.");
      });
  }, [id]);

  const visibleStatus = order ? order.status : "";
  const activeIndex = order ? steps.indexOf(visibleStatus) : -1;
  const terminal = order ? terminalStatuses.includes(order.status) : false;

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Order tracking</p>
        <h1 className="mt-4 font-display text-6xl font-semibold text-ivory">Your Sacred Spices journey.</h1>
        <p className="mt-5 rounded-lg border border-turmeric/16 bg-charcoal px-4 py-3 text-sm text-ivory/68">{message}</p>
        {order ? (
          <div className="mt-8 rounded-lg border border-turmeric/16 bg-charcoal p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-3xl text-ivory">#{order.trackingCode}</h2>
              <span className="rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-obsidian">{visibleStatus}</span>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-5">
              {(terminal ? ["PLACED", visibleStatus] : steps).map((step, index) => (
                <div key={step} className={`rounded-lg border p-4 ${terminal && step === visibleStatus ? "border-rose bg-rose/10" : index <= activeIndex ? "border-saffron bg-saffron/10" : "border-turmeric/12"}`}>
                  <p className="text-sm font-semibold text-ivory">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3">
              {order.items.map((item) => (
                <div key={item.product.name} className="flex justify-between rounded-lg border border-turmeric/10 p-4 text-sm text-ivory/70">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>Included</span>
                </div>
              ))}
              <p className="text-right text-xl font-semibold text-saffron">Rs. {order.total}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
