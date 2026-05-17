import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const CART_COOKIE = "sacred_cart_id";

export async function getOrCreateCart() {
  const user = await getSessionUser();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value ?? randomUUID();

  if (user) {
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
      include: { items: { include: { product: true } } }
    });
    return cart;
  }

  cookieStore.set(CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return prisma.cart.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
    include: { items: { include: { product: true } } }
  });
}

export function cartTotal(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  return cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
}
