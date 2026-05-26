import type { OrderStatus } from "@prisma/client";
import { businessInfo, publicSupportEmail, publicSupportPhone } from "@/lib/business-info";

type OrderEmailItem = {
  quantity: number;
  unitPrice: number;
  product: {
    name: string;
  };
};

export type OrderEmailData = {
  trackingCode: string;
  total: number;
  status: OrderStatus;
  items: OrderEmailItem[];
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

type Template = {
  subject: string;
  text: string;
  html: string;
};

const statusSubjects: Partial<Record<OrderStatus, string>> = {
  PACKED: "Your order is packed",
  SHIPPED: "Your order is on the way",
  DELIVERED: "Order delivered",
  CANCELLED: "Order cancelled",
  REFUNDED: "Your Sacred Spices refund update"
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function customerGreeting(name?: string | null) {
  return name?.trim() ? `Hello ${name.trim()},` : "Hello,";
}

function productSummary(items: OrderEmailItem[]) {
  return items.map((item) => `${item.quantity} x ${item.product.name}`).join(", ");
}

function baseText(lines: string[]) {
  return [
    ...lines,
    "",
    `Support: ${publicSupportEmail()} | ${publicSupportPhone()}`,
    businessInfo.brandName
  ].join("\n");
}

function baseHtml({ heading, body, cta }: { heading: string; body: string; cta?: string }) {
  return `
    <div style="margin:0;background:#f7efe3;padding:24px 0;font-family:Arial,sans-serif;color:#1d130b;">
      <div style="max-width:640px;margin:0 auto;background:#fffaf2;border:1px solid #ead9bd;border-radius:12px;overflow:hidden;">
        <div style="background:#1d130b;color:#fffaf2;padding:24px;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#f3a51f;">${escapeHtml(businessInfo.brandName)}</p>
          <h1 style="margin:0;font-size:28px;line-height:1.2;">${escapeHtml(heading)}</h1>
        </div>
        <div style="padding:24px;font-size:15px;line-height:1.7;">
          ${body}
          ${cta ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(cta)}" style="display:inline-block;background:#f3a51f;color:#1d130b;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;">Open link</a></p>` : ""}
          <hr style="border:none;border-top:1px solid #ead9bd;margin:24px 0;" />
          <p style="margin:0;color:#6f5a42;font-size:13px;">Support: ${escapeHtml(publicSupportEmail())} | ${escapeHtml(publicSupportPhone())}</p>
        </div>
      </div>
    </div>
  `;
}

function orderDetailsHtml(order: OrderEmailData) {
  const rows = order.items
    .map((item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #ead9bd;">${escapeHtml(item.product.name)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #ead9bd;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #ead9bd;text-align:right;">${escapeHtml(formatCurrency(Number(item.unitPrice) * item.quantity))}</td>
      </tr>
    `)
    .join("");

  return `
    <p><strong>Order ID / tracking code:</strong> ${escapeHtml(order.trackingCode)}</p>
    <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:1px solid #c9aa72;">Product</th>
          <th style="text-align:center;padding:8px 0;border-bottom:1px solid #c9aa72;">Qty</th>
          <th style="text-align:right;padding:8px 0;border-bottom:1px solid #c9aa72;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:18px;"><strong>Total:</strong> ${escapeHtml(formatCurrency(order.total))}</p>
  `;
}

export function passwordResetEmailTemplate({ resetUrl }: { resetUrl: string }): Template {
  return {
    subject: "Reset your password",
    text: baseText([
      `We received a request to reset your ${businessInfo.brandName} password.`,
      "Use this secure link to choose a new password:",
      resetUrl,
      "This link expires in 45 minutes and can be used only once.",
      "If you did not request this, you can ignore this email."
    ]),
    html: baseHtml({
      heading: "Reset your password",
      cta: resetUrl,
      body: `
        <p>We received a request to reset your ${escapeHtml(businessInfo.brandName)} password.</p>
        <p>This secure link expires in 45 minutes and can be used only once.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `
    })
  };
}

export function welcomeEmailTemplate({ name }: { name?: string | null }): Template {
  return {
    subject: "Welcome to Sacred Spices",
    text: baseText([
      customerGreeting(name),
      `Welcome to ${businessInfo.brandName}. Your account is ready.`,
      "You can now browse products, save your details, and track your orders."
    ]),
    html: baseHtml({
      heading: "Welcome to Sacred Spices",
      body: `
        <p>${escapeHtml(customerGreeting(name))}</p>
        <p>Your account is ready. You can now browse products, save your details, and track your orders.</p>
        <p>Thank you for joining our kitchen.</p>
      `
    })
  };
}

export function orderPlacedEmailTemplate(order: OrderEmailData): Template {
  return orderTemplate({
    order,
    subject: "Your order has been placed",
    heading: "Your order has been placed",
    intro: "We have received your order and will keep you updated as it moves ahead."
  });
}

export function paymentReceivedEmailTemplate(order: OrderEmailData): Template {
  return orderTemplate({
    order,
    subject: "Payment received",
    heading: "Payment received",
    intro: "Your payment has been received and your order is confirmed."
  });
}

export function orderStatusEmailTemplate(order: OrderEmailData): Template | null {
  const subject = statusSubjects[order.status];
  if (!subject) return null;

  const introByStatus: Record<string, string> = {
    PACKED: "Your order has been packed with care.",
    SHIPPED: "Your order is on the way.",
    DELIVERED: "Your order has been delivered. We hope it brings warmth to your kitchen.",
    CANCELLED: "Your order has been cancelled.",
    REFUNDED: "Here is an update on your refund."
  };

  return orderTemplate({
    order,
    subject,
    heading: subject,
    intro: introByStatus[order.status] ?? "Your order status has been updated."
  });
}

function orderTemplate({ order, subject, heading, intro }: { order: OrderEmailData; subject: string; heading: string; intro: string }): Template {
  const summary = productSummary(order.items);
  return {
    subject,
    text: baseText([
      customerGreeting(order.user?.name),
      intro,
      `Order ID / tracking code: ${order.trackingCode}`,
      `Status: ${order.status}`,
      `Products: ${summary}`,
      `Total: ${formatCurrency(order.total)}`
    ]),
    html: baseHtml({
      heading,
      body: `
        <p>${escapeHtml(customerGreeting(order.user?.name))}</p>
        <p>${escapeHtml(intro)}</p>
        ${orderDetailsHtml(order)}
      `
    })
  };
}
