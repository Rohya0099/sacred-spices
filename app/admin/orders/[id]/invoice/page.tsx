import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/brand-shell";
import { PrintButton } from "@/components/print-button";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { businessInfo, fssaiDisplay, supportDisplay } from "@/lib/business-info";

function formatAddress(address: unknown) {
  if (!address || typeof address !== "object") return "Address unavailable";
  const data = address as Record<string, unknown>;
  return [data.name, data.phone, data.line1, data.line2, data.city, data.state, data.pincode].filter(Boolean).join(", ");
}

export default async function AdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { trackingCode: id }] },
    include: { user: true, items: { include: { product: true } } }
  });
  if (!order) notFound();

  return (
    <PageShell>
      <style>{`
        @media print {
          header, footer, nav, .no-print {
            display: none !important;
          }

          html, body {
            background: #ffffff !important;
          }

          main {
            padding-top: 0 !important;
            min-height: auto !important;
          }

          .invoice-page {
            padding: 0 !important;
            background: #ffffff !important;
          }

          .invoice-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 20px !important;
            border: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #111111 !important;
          }

          .invoice-container table {
            page-break-inside: avoid;
          }
        }
      `}</style>
      <section className="invoice-page px-4 py-12 sm:px-6 lg:px-8 print:p-0">
        <div className="no-print mx-auto mb-4 flex max-w-4xl justify-end">
          <Link href="/admin" className="inline-flex items-center rounded-full border border-turmeric/25 px-4 py-2 text-sm font-semibold text-saffron transition hover:border-saffron">
            Back to Admin
          </Link>
        </div>
        <div className="invoice-container mx-auto max-w-4xl rounded-lg border border-turmeric/16 bg-ivory p-8 text-obsidian print:border-0 print:shadow-none">
          <div className="flex flex-col gap-4 border-b border-obsidian/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-4xl font-semibold">{businessInfo.brandName}</p>
              <p className="mt-1 text-sm uppercase tracking-[0.24em] text-obsidian/60">{businessInfo.tagline}</p>
              <p className="mt-3 text-sm">{fssaiDisplay}</p>
              <p className="text-sm">{supportDisplay()}</p>
            </div>
            <PrintButton />
          </div>

          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-semibold">Invoice / Order ID</p>
              <p>{order.id}</p>
              <p className="mt-3 font-semibold">Tracking Code</p>
              <p>{order.trackingCode}</p>
              <p className="mt-3 font-semibold">Order Date</p>
              <p>{order.createdAt.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="font-semibold">Customer</p>
              <p>{order.user?.name ?? "Guest customer"}</p>
              <p>{order.user?.email ?? "Email unavailable"}</p>
              <p>{order.user?.phone ?? "Phone unavailable"}</p>
              <p className="mt-3 font-semibold">Shipping Address</p>
              <p>{formatAddress(order.address)}</p>
            </div>
          </div>

          {order.isPreorder ? <p className="mt-6 inline-flex rounded-full bg-saffron px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">Preorder</p> : null}

          <table className="mt-6 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-obsidian/15">
                <th className="py-3">Product</th>
                <th className="py-3 text-right">Qty</th>
                <th className="py-3 text-right">Price</th>
                <th className="py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-obsidian/10">
                  <td className="py-3">{item.product.name}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">Rs. {Number(item.unitPrice).toLocaleString("en-IN")}</td>
                  <td className="py-3 text-right">Rs. {(Number(item.unitPrice) * item.quantity).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto mt-6 grid max-w-sm gap-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {Number(order.subtotal).toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>Rs. {Number(order.discount).toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Rs. {Number(order.shipping).toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between border-t border-obsidian/10 pt-3 text-lg font-semibold"><span>Total</span><span>Rs. {Number(order.total).toLocaleString("en-IN")}</span></div>
          </div>

          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            <p><strong>Payment status:</strong> {order.razorpayPaymentId ? "Paid" : "Awaiting payment"}</p>
            <p><strong>Order status:</strong> {order.status}</p>
            <p><strong>Razorpay order:</strong> {order.razorpayOrderId ?? "Not created"}</p>
            <p><strong>Razorpay payment:</strong> {order.razorpayPaymentId ?? "Not paid"}</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
