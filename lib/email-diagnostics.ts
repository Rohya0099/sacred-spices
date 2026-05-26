import type { EmailResult } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export function isValidEmailAddress(value?: string | null) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export function logOrderEmailTriggered(templateName: string) {
  console.info(`Order email triggered: ${templateName}`);
}

export function logOrderEmailResult(templateName: string, result: EmailResult) {
  if (result.ok) {
    console.info(`Order email sent: ${templateName}`);
    return;
  }

  const reason = result.skipped ? result.reason : result.reason;
  console.warn(`Order email failed: ${templateName} ${reason}`);
}

export async function ensureOrderEmailRecipient<T extends { userId?: string | null; user?: { email?: string | null; name?: string | null } | null }>(order: T) {
  const currentEmail = order.user?.email;
  if (isValidEmailAddress(currentEmail)) {
    console.info(`Using email for order: ${currentEmail}`);
    return order;
  }

  if (!order.userId) {
    console.info("Using email for order: unavailable");
    return order;
  }

  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { email: true, name: true }
  });

  if (user && isValidEmailAddress(user.email)) {
    console.info(`Using email for order: ${user.email}`);
    return {
      ...order,
      user: {
        ...(order.user ?? {}),
        email: user.email,
        name: order.user?.name ?? user.name
      }
    };
  }

  console.info("Using email for order: unavailable");
  return order;
}
