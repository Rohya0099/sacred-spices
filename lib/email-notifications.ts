import type { Order, OrderItem, Product, User } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { isValidEmailAddress } from "@/lib/email-diagnostics";
import {
  orderPlacedEmailTemplate,
  orderStatusEmailTemplate,
  paymentReceivedEmailTemplate,
  type OrderEmailData,
  welcomeEmailTemplate
} from "@/lib/email-templates";

type OrderForEmail = Order & {
  user?: User | null;
  items: Array<OrderItem & { product: Product }>;
};

function toOrderEmailData(order: OrderForEmail): OrderEmailData {
  return {
    trackingCode: order.trackingCode,
    total: Number(order.total),
    status: order.status,
    user: order.user
      ? {
          name: order.user.name,
          email: order.user.email
        }
      : null,
    items: order.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      product: {
        name: item.product.name
      }
    }))
  };
}

export async function sendWelcomeEmail(user: Pick<User, "email" | "name">) {
  const template = welcomeEmailTemplate({ name: user.name });
  return sendEmail({ to: user.email, templateName: "welcome", ...template });
}

export async function sendOrderPlacedEmail(order: OrderForEmail) {
  const to = order.user?.email ?? "";
  if (!isValidEmailAddress(to)) {
    console.info("Email skipped: order placed recipient missing");
    return { ok: false as const, skipped: true as const, reason: "recipient_missing_or_invalid" as const };
  }
  const template = orderPlacedEmailTemplate(toOrderEmailData(order));
  return sendEmail({ to, templateName: "order-placed", ...template });
}

export async function sendPaymentReceivedEmail(order: OrderForEmail) {
  const to = order.user?.email ?? "";
  if (!isValidEmailAddress(to)) {
    console.info("Email skipped: payment received recipient missing");
    return { ok: false as const, skipped: true as const, reason: "recipient_missing_or_invalid" as const };
  }
  const template = paymentReceivedEmailTemplate(toOrderEmailData(order));
  return sendEmail({ to, templateName: "payment-received", ...template });
}

export async function sendOrderStatusEmail(order: OrderForEmail) {
  const to = order.user?.email ?? "";
  if (!isValidEmailAddress(to)) {
    console.info("Email skipped: order status recipient missing");
    return { ok: false as const, skipped: true as const, reason: "recipient_missing_or_invalid" as const };
  }
  const template = orderStatusEmailTemplate(toOrderEmailData(order));
  if (!template) return { ok: true as const };
  return sendEmail({ to, templateName: `order-status-${order.status.toLowerCase()}`, ...template });
}
