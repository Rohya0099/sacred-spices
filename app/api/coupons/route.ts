import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { rateLimit, verifyCsrf } from "@/lib/security";

const couponSchema = z.object({
  code: z.string().min(2)
});

export async function POST(request: Request) {
  try {
    await rateLimit("coupons", 20, 60_000);
    await verifyCsrf(request);
    const body = await request.json().catch(() => null);
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: parsed.data.code.toUpperCase() } });
    const now = new Date();
    const active =
      coupon?.isActive &&
      (!coupon.startsAt || coupon.startsAt <= now) &&
      (!coupon.endsAt || coupon.endsAt >= now);

    if (!coupon || !active) {
      return NextResponse.json({ valid: false, message: "Coupon not found or inactive." }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      percentOff: coupon.percentOff,
      amountOff: coupon.amountOff ? Number(coupon.amountOff) : null,
      message: "Coupon applied."
    });
  } catch (error) {
    return handleApiError(error);
  }
}
