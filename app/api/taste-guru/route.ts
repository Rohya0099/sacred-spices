import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { serializeProduct } from "@/lib/serializers";
import { isPreorderEligible } from "@/lib/preorder";
import { rateLimit, verifyCsrf } from "@/lib/security";

const tasteGuruSchema = z.object({
  heat: z.enum(["Gentle", "Medium", "Bold"]).optional(),
  mood: z.enum(["Tangy", "Smoky", "Balanced"]).optional(),
  region: z.enum(["North", "South", "Mixed"]).optional(),
  occasion: z.enum(["Daily", "Weekend", "Festival"]).optional(),
  family: z.enum(["1-2", "3-4", "5+"]).optional(),
  dish: z.enum(["Dal and sabzi", "Rice and rasam", "Grills and curries"]).optional()
});

function normalizedText(product: {
  name: string;
  description: string;
  emotionalStory: string;
  tasteProfile: string[];
  regionalInspiration: string;
  cookingRecommendations: string[];
  category?: { name: string } | null;
}) {
  return [
    product.name,
    product.description,
    product.emotionalStory,
    product.tasteProfile.join(" "),
    product.regionalInspiration,
    product.cookingRecommendations.join(" "),
    product.category?.name ?? ""
  ].join(" ").toLowerCase();
}

function heatScore(spiceLevel: number, heat?: string) {
  if (!heat) return 0;
  if (heat === "Gentle") return spiceLevel <= 2 ? 24 : spiceLevel === 3 ? 10 : 0;
  if (heat === "Medium") return spiceLevel === 3 ? 24 : spiceLevel === 2 || spiceLevel === 4 ? 12 : 0;
  return spiceLevel >= 4 ? 24 : spiceLevel === 3 ? 10 : 0;
}

function scoreProduct(product: Awaited<ReturnType<typeof prisma.product.findMany>>[number], preferences: z.infer<typeof tasteGuruSchema>) {
  const text = normalizedText(product);
  const reasons: string[] = [];
  let score = heatScore(product.spiceLevel, preferences.heat);
  if (score > 0 && preferences.heat) reasons.push(`matches your ${preferences.heat.toLowerCase()} heat preference`);

  if (preferences.mood === "Tangy" && /(tangy|pickle|mango|lemon|achar|citrus|raw mango)/.test(text)) {
    score += 22;
    reasons.push("brings the tangy pickle-style lift you asked for");
  }
  if (preferences.mood === "Smoky" && /(smoky|roasted|toast|fiery|kolhapuri|grill)/.test(text)) {
    score += 22;
    reasons.push("leans into roasted, smoky depth");
  }
  if (preferences.mood === "Balanced" && /(balanced|everyday|daily|all-purpose|warm|layered)/.test(text)) {
    score += 16;
    reasons.push("keeps the flavor balanced for repeat cooking");
  }

  if (preferences.region && preferences.region !== "Mixed" && text.includes(preferences.region.toLowerCase())) {
    score += 18;
    reasons.push(`fits your ${preferences.region} Indian taste preference`);
  }
  if (preferences.region === "Mixed" && /(pan-indian|mixed|modern|everyday|family)/.test(text)) {
    score += 12;
    reasons.push("works across mixed Indian home cooking");
  }

  if (preferences.occasion === "Festival" && /(festival|gift|diwali|celebration|box|biryani|royal)/.test(text)) {
    score += 22;
    reasons.push("feels giftable and festive");
  }
  if (preferences.occasion === "Daily" && /(daily|everyday|dal|sabzi|kitchen|all-purpose)/.test(text)) {
    score += 18;
    reasons.push("is practical for daily meals");
  }
  if (preferences.occasion === "Weekend" && /(biryani|gravy|paneer|grill|curries|bold)/.test(text)) {
    score += 14;
    reasons.push("has enough character for a weekend meal");
  }

  if (preferences.family === "5+" && /(box|family|biryani|kitchen|all-purpose|combo)/.test(text)) {
    score += 10;
    reasons.push("scales well for a larger family table");
  }

  if (preferences.dish === "Dal and sabzi" && /(dal|sabzi|aloo|vegetables|kitchen|garam)/.test(text)) {
    score += 18;
    reasons.push("pairs naturally with dal and sabzi");
  }
  if (preferences.dish === "Rice and rasam" && /(rice|rasam|pickle|lemon|mango|tangy|turmeric)/.test(text)) {
    score += 18;
    reasons.push("adds brightness beside rice-based meals");
  }
  if (preferences.dish === "Grills and curries" && /(grill|curries|gravy|kolhapuri|chilli|biryani|paneer)/.test(text)) {
    score += 18;
    reasons.push("has the body needed for grills and curries");
  }

  if (product.isBestSeller) score += 5;
  if (product.isFeatured) score += 4;

  return {
    product,
    score,
    reason: reasons.length
      ? reasons.slice(0, 3).join(", ") + "."
      : "This is the closest catalog match based on your selected taste profile."
  };
}

export async function POST(request: Request) {
  try {
    await rateLimit("ai-taste-guru", 15, 60_000);
    await verifyCsrf(request);
    const body = await request.json().catch(() => null);
    const parsed = tasteGuruSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid taste preferences." }, { status: 400 });
    }

    const user = await getSessionUser();
    const dbProducts = await prisma.product.findMany({
      where: { inventory: { gt: 0 }, isActive: true },
      include: { category: true },
      orderBy: [{ isBestSeller: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }]
    });

    const ranked = dbProducts
      .map((product) => scoreProduct(product, parsed.data))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const exact = ranked.some((item) => item.score >= 45);
    const recommendations = ranked.map((item) => ({
      product: serializeProduct(item.product),
      reason: item.reason,
      score: item.score,
      isPreorderAvailable: isPreorderEligible(item.product)
    }));

    const output = JSON.stringify({
      preferences: parsed.data,
      exact,
      recommendedProducts: recommendations.map((item) => ({
        name: item.product.name,
        reason: item.reason,
        score: item.score
      }))
    });

    const history = await prisma.generatedContent.create({
      data: {
        userId: user?.id,
        productId: ranked[0]?.product.id,
        type: "PRODUCT_STORY",
        prompt: JSON.stringify(parsed.data),
        output,
        metadata: {
          kind: "taste-guru-product-match",
          exact
        }
      }
    });

    return NextResponse.json({
      source: "catalog-match",
      exact,
      recommendations,
      historyId: history.id
    });
  } catch (error) {
    return handleApiError(error);
  }
}
