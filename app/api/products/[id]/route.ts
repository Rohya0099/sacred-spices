import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseList } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { serializeProduct } from "@/lib/serializers";
import { sanitizeText, verifyCsrf } from "@/lib/security";

const updateProductSchema = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  emotionalStory: z.string().min(10).optional(),
  ingredients: z.union([z.string(), z.array(z.string())]).optional(),
  tasteProfile: z.union([z.string(), z.array(z.string())]).optional(),
  regionalInspiration: z.string().min(2).optional(),
  cookingRecommendations: z.union([z.string(), z.array(z.string())]).optional(),
  shelfLife: z.string().min(2).optional(),
  spiceLevel: z.number().int().min(1).max(5).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().nullable().optional(),
  inventory: z.number().int().min(0).optional(),
  primaryImage: z.string().optional(),
  images: z.union([z.string(), z.array(z.string())]).optional(),
  weight: z.string().min(1).optional(),
  packageType: z.string().min(2).optional(),
  storageInstructions: z.string().min(5).optional(),
  spiceLevelLabel: z.string().min(2).optional(),
  bestWith: z.union([z.string(), z.array(z.string())]).optional(),
  servesApprox: z.string().min(2).optional(),
  handcraftedNotes: z.string().min(5).optional(),
  badge: z.string().nullable().optional(),
  isBestSeller: z.boolean().optional(),
  isFeatured: z.boolean().optional()
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product: serializeProduct(product) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await verifyCsrf(request);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: productValidationMessage(parsed.error), fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        name: data.name ? sanitizeText(data.name, 120) : undefined,
        slug: data.slug ? sanitizeText(data.slug, 140) : undefined,
        description: data.description ? sanitizeText(data.description, 1000) : undefined,
        emotionalStory: data.emotionalStory ? sanitizeText(data.emotionalStory, 1200) : undefined,
        regionalInspiration: data.regionalInspiration ? sanitizeText(data.regionalInspiration, 200) : undefined,
        shelfLife: data.shelfLife ? sanitizeText(data.shelfLife, 200) : undefined,
        primaryImage: data.primaryImage ? sanitizeText(data.primaryImage, 300) : data.images ? parseList(data.images)[0] ?? "" : undefined,
        weight: data.weight ? sanitizeText(data.weight, 40) : undefined,
        packageType: data.packageType ? sanitizeText(data.packageType, 80) : undefined,
        storageInstructions: data.storageInstructions ? sanitizeText(data.storageInstructions, 300) : undefined,
        spiceLevelLabel: data.spiceLevelLabel ? sanitizeText(data.spiceLevelLabel, 40) : undefined,
        bestWith: data.bestWith ? parseList(data.bestWith) : undefined,
        servesApprox: data.servesApprox ? sanitizeText(data.servesApprox, 120) : undefined,
        handcraftedNotes: data.handcraftedNotes ? sanitizeText(data.handcraftedNotes, 400) : undefined,
        badge: data.badge ? sanitizeText(data.badge, 60) : data.badge,
        ingredients: data.ingredients ? parseList(data.ingredients) : undefined,
        tasteProfile: data.tasteProfile ? parseList(data.tasteProfile) : undefined,
        cookingRecommendations: data.cookingRecommendations ? parseList(data.cookingRecommendations) : undefined,
        images: data.images ? parseList(data.images) : undefined
      },
      include: { category: true }
    });

    return NextResponse.json({ product: serializeProduct(product) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await verifyCsrf(_);
    const { id } = await params;
    const linkedOrderItem = await prisma.orderItem.findFirst({ where: { productId: id }, select: { id: true } });
    if (linkedOrderItem) {
      return NextResponse.json({ error: "Products with order history cannot be deleted. Set inventory to 0 instead." }, { status: 409 });
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
