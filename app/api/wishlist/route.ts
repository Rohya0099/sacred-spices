import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { serializeWishlist } from "@/lib/serializers";
import { rateLimit, verifyCsrf } from "@/lib/security";

const wishlistSchema = z.object({
  productId: z.string().min(1)
});

export async function GET() {
  try {
    await rateLimit("wishlist", 30, 60_000);
    const user = await requireUser();
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
      include: { items: { include: { product: { include: { category: true } } } } }
    });
    return NextResponse.json({ wishlist: serializeWishlist(wishlist) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await rateLimit("wishlist", 30, 60_000);
    await verifyCsrf(request);
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = wishlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid wishlist item." }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });

    await prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId: parsed.data.productId } },
      update: {},
      create: { wishlistId: wishlist.id, productId: parsed.data.productId }
    });

    const updatedWishlist = await prisma.wishlist.findUniqueOrThrow({
      where: { id: wishlist.id },
      include: { items: { include: { product: { include: { category: true } } } } }
    });

    return NextResponse.json({ wishlist: serializeWishlist(updatedWishlist) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await rateLimit("wishlist", 30, 60_000);
    await verifyCsrf(request);
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "Missing productId." }, { status: 400 });

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (wishlist) {
      await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
    }
    return NextResponse.json({ status: "removed" });
  } catch (error) {
    return handleApiError(error);
  }
}
