import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { rateLimit, sanitizeText, verifyCsrf } from "@/lib/security";
import type { GeneratedContentType } from "@prisma/client";

const marketingSchema = z.object({
  channel: z.enum(["instagram", "ad", "whatsapp", "festival", "story", "email"]),
  productName: z.string().min(2).max(120),
  campaignMood: z.string().max(160).optional()
});

const channelLabels = {
  instagram: "Instagram caption",
  ad: "advertising copy",
  whatsapp: "WhatsApp sales message",
  festival: "festival campaign",
  story: "product storytelling",
  email: "email marketing copy"
};

const generatedTypeByChannel: Record<z.infer<typeof marketingSchema>["channel"], GeneratedContentType> = {
  instagram: "INSTAGRAM_CAPTION",
  ad: "AD_COPY",
  whatsapp: "WHATSAPP_MESSAGE",
  festival: "FESTIVAL_CAMPAIGN",
  story: "PRODUCT_STORY",
  email: "EMAIL_COPY"
};

async function requireMarketingAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }
  return { user, response: null };
}

export async function POST(request: Request) {
  try {
    // Access policy: public/incognito = 401, customer = 401, admin = 200.
    const { user, response } = await requireMarketingAdmin();
    if (response) return response;
    await rateLimit("ai-marketing", 10, 60_000);
    await verifyCsrf(request);
    const body = await request.json().catch(() => null);
    const parsed = marketingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid marketing request." }, { status: 400 });
    }

    const client = getOpenAIClient();
    const prompt = `Create premium, honest ${channelLabels[parsed.data.channel]} for ${sanitizeText(parsed.data.productName, 120)}.
Mood: ${sanitizeText(parsed.data.campaignMood ?? "warm, soulful, Indian luxury", 160)}.
Avoid fake reviews, medical claims, invented scarcity, or manipulative spirituality.`;

    let source = "fallback";
    let content = `Bring ${parsed.data.productName} into the meal with warmth, memory, and honest craft. Designed for kitchens where flavor matters and every pinch is chosen with care.`;

    if (client) {
      source = "openai";
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 500
      });
      content = completion.choices[0]?.message.content ?? content;
    }

    const generated = await prisma.generatedContent.create({
      data: {
        userId: user?.id,
        type: generatedTypeByChannel[parsed.data.channel],
        prompt,
        output: content,
        metadata: {
          productName: parsed.data.productName,
          campaignMood: parsed.data.campaignMood,
          source
        }
      }
    });

    return NextResponse.json({ source, content, generatedId: generated.id });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    // Access policy: public/incognito = 401, customer = 401, admin = 200.
    const { response } = await requireMarketingAdmin();
    if (response) return response;
    const generated = await prisma.generatedContent.findMany({
      orderBy: { createdAt: "desc" },
      take: 30
    });
    return NextResponse.json({ generated });
  } catch (error) {
    return handleApiError(error);
  }
}
