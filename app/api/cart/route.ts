import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { serializeCart } from "@/lib/serializers";
import { rateLimit, verifyCsrf } from "@/lib/security";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive()
});

export async function GET() {
  try {
    await rateLimit("cart", 30, 60_000);
    await requireUser();
    const cart = await getOrCreateCart();
    return NextResponse.json({ cart: serializeCart(cart) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await rateLimit("cart", 30, 60_000);
    await verifyCsrf(request);
    await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = cartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: parsed.data.productId }, { slug: parsed.data.productId }] }
    });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    if (!product.isActive) return NextResponse.json({ error: "This product is currently unavailable." }, { status: 409 });

    const cart = await getOrCreateCart();
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      update: { quantity: { increment: parsed.data.quantity } },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: parsed.data.quantity
      }
    });

    const updatedCart = await getOrCreateCart();
    return NextResponse.json({ cart: serializeCart(updatedCart) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await rateLimit("cart", 30, 60_000);
    await verifyCsrf(request);
    await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = cartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
    }

    const cart = await getOrCreateCart();
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: parsed.data.productId }, { slug: parsed.data.productId }] }
    });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    if (!product.isActive) return NextResponse.json({ error: "This product is currently unavailable." }, { status: 409 });

    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      data: { quantity: parsed.data.quantity }
    });

    const updatedCart = await getOrCreateCart();
    return NextResponse.json({ cart: serializeCart(updatedCart) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await rateLimit("cart", 30, 60_000);
    await verifyCsrf(request);
    await requireUser();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const cart = await getOrCreateCart();

    if (productId) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    } else {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    const updatedCart = await getOrCreateCart();
    return NextResponse.json({ cart: serializeCart(updatedCart) });
  } catch (error) {
    return handleApiError(error);
  }
}
