import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseList } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { serializeProduct } from "@/lib/serializers";
import { sanitizeText, verifyCsrf } from "@/lib/security";

const productSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  emotionalStory: z.string().min(10),
  ingredients: z.union([z.string(), z.array(z.string())]),
  tasteProfile: z.union([z.string(), z.array(z.string())]),
  regionalInspiration: z.string().min(2),
  cookingRecommendations: z.union([z.string(), z.array(z.string())]),
  shelfLife: z.string().min(2),
  spiceLevel: z.number().int().min(1).max(5),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  inventory: z.number().int().min(0),
  primaryImage: z.string().optional().default(""),
  images: z.union([z.string(), z.array(z.string())]).default([]),
  weight: z.string().min(1).default("250g"),
  packageType: z.string().min(2).default("Premium Pouch"),
  storageInstructions: z.string().min(5).default("Store in a cool, dry place. Use a clean, dry spoon."),
  spiceLevelLabel: z.string().min(2).default("Medium"),
  bestWith: z.union([z.string(), z.array(z.string())]).default([]),
  servesApprox: z.string().min(2).default("Serves family meals depending on usage."),
  handcraftedNotes: z.string().min(5).default("Prepared in small batches for freshness and aroma."),
  badge: z.string().optional().nullable(),
  isBestSeller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

function productValidationMessage(error: z.ZodError) {
  const fieldErrors = error.flatten().fieldErrors;
  const firstField = Object.keys(fieldErrors).find((field) => fieldErrors[field]?.length);
  if (!firstField) return "Invalid product payload.";

  const labelByField: Record<string, string> = {
    categoryId: "Category",
    name: "Name",
    slug: "Slug",
    description: "Description",
    emotionalStory: "Product story",
    ingredients: "Ingredients",
    tasteProfile: "Taste profile",
    regionalInspiration: "Regional inspiration",
    cookingRecommendations: "Cooking recommendations",
    shelfLife: "Shelf life",
    spiceLevel: "Spice level",
    price: "Price",
    inventory: "Inventory",
    primaryImage: "Primary image",
    images: "Images",
    weight: "Weight",
    packageType: "Package type",
    storageInstructions: "Storage instructions",
    spiceLevelLabel: "Spice level label",
    bestWith: "Best with",
    servesApprox: "Serves approx.",
    handcraftedNotes: "Handcrafted notes"
  };

  const rawMessage = fieldErrors[firstField]?.[0] ?? "is invalid";
  const readableMessage = rawMessage
    .replace("Expected number, received string", "must be a number")
    .replace("Required", "is required");
  return `${labelByField[firstField] ?? firstField}: ${readableMessage}`;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true }
    });

    return NextResponse.json({ products: products.map(serializeProduct) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await verifyCsrf(request);
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: productValidationMessage(parsed.error), fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    const product = await prisma.product.create({
      data: {
        ...data,
        name: sanitizeText(data.name, 120),
        slug: sanitizeText(data.slug, 140),
        description: sanitizeText(data.description, 1000),
        emotionalStory: sanitizeText(data.emotionalStory, 1200),
        regionalInspiration: sanitizeText(data.regionalInspiration, 200),
        shelfLife: sanitizeText(data.shelfLife, 200),
        primaryImage: data.primaryImage ? sanitizeText(data.primaryImage, 300) : parseList(data.images)[0] ?? "",
        weight: sanitizeText(data.weight, 40),
        packageType: sanitizeText(data.packageType, 80),
        storageInstructions: sanitizeText(data.storageInstructions, 300),
        spiceLevelLabel: sanitizeText(data.spiceLevelLabel, 40),
        servesApprox: sanitizeText(data.servesApprox, 120),
        handcraftedNotes: sanitizeText(data.handcraftedNotes, 400),
        badge: data.badge ? sanitizeText(data.badge, 60) : null,
        ingredients: parseList(data.ingredients),
        tasteProfile: parseList(data.tasteProfile),
        cookingRecommendations: parseList(data.cookingRecommendations),
        bestWith: parseList(data.bestWith),
        images: parseList(data.images),
        compareAtPrice: data.compareAtPrice ?? null
      },
      include: { category: true }
    });

    return NextResponse.json({ product: serializeProduct(product) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
