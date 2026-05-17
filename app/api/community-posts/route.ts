import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { rateLimit, sanitizeText, verifyCsrf } from "@/lib/security";

const communityPostSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(10),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([])
});

export async function GET() {
  try {
    const posts = await prisma.communityPost.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ posts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await rateLimit("community-posts", 10, 60_000);
    await verifyCsrf(request);
    const user = await getSessionUser();
    const body = await request.json().catch(() => null);
    const parsed = communityPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid community post." }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        title: sanitizeText(parsed.data.title, 140),
        body: sanitizeText(parsed.data.body, 3000),
        tags: parsed.data.tags.map((tag) => sanitizeText(tag, 40)).slice(0, 8),
        images: parsed.data.images.slice(0, 6),
        userId: user?.id
      }
    });

    return NextResponse.json({ status: "submitted-for-moderation", post }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
