import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { getSessionUser, requireUser } from "@/lib/auth";
import { serializeOrder } from "@/lib/serializers";
import { shouldCreatePreorderFromCheckout } from "@/lib/preorder";
import { rateLimit, sanitizeText, verifyCsrf } from "@/lib/security";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } }
    });

    return NextResponse.json({ orders: orders.map(serializeOrder) });
  } catch (error) {
    return handleApiError(error);
  }
}

const orderSchema = z.object({
  address: z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
    line1: z.string().min(4),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4)
  }),
  couponCode: z.string().optional(),
  isPreorder: z.boolean().optional(),
  preorderSlug: z.string().min(1).optional()
});

export async function POST(request: Request) {
  try {
    await rateLimit("checkout", 8, 60_000);
    await verifyCsrf(request);
    const body = await request.json().catch(() => null);
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order payload.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const user = await requireUser();
    const cart = await getOrCreateCart();
    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    const isPreorder = shouldCreatePreorderFromCheckout(
      cart.items,
      parsed.data.preorderSlug ?? (parsed.data.isPreorder ? undefined : null)
    );
    const unavailable = cart.items.find((item) => item.product.inventory < item.quantity);
    const pausedItem = cart.items.find((item) => !item.product.isActive);
    if (pausedItem) {
      return NextResponse.json({ error: "This product is currently unavailable." }, { status: 409 });
    }
    if (unavailable && !isPreorder) {
      return NextResponse.json({ error: `${unavailable.product.name} does not have enough stock.` }, { status: 409 });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const coupon = parsed.data.couponCode
      ? await prisma.coupon.findUnique({ where: { code: parsed.data.couponCode.toUpperCase() } })
      : null;
    const discount = coupon?.isActive
      ? coupon.percentOff
        ? Math.round((subtotal * coupon.percentOff) / 100)
        : Number(coupon.amountOff ?? 0)
      : 0;
    const shipping = subtotal > 999 ? 0 : 70;
    const total = Math.max(subtotal - discount + shipping, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: "PLACED",
          isPreorder,
          subtotal,
          discount,
          shipping,
          total,
          couponCode: coupon?.code,
          address: {
            ...parsed.data.address,
            name: sanitizeText(parsed.data.address.name, 80),
            phone: sanitizeText(parsed.data.address.phone, 30),
            line1: sanitizeText(parsed.data.address.line1, 160),
            line2: parsed.data.address.line2 ? sanitizeText(parsed.data.address.line2, 160) : undefined,
            city: sanitizeText(parsed.data.address.city, 80),
            state: sanitizeText(parsed.data.address.state, 80),
            pincode: sanitizeText(parsed.data.address.pincode, 20)
          },
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price
            }))
          }
        },
        include: { items: { include: { product: true } } }
      });

      return created;
    });

    return NextResponse.json({ order: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
