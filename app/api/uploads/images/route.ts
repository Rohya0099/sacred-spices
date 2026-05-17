import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { requireAdmin, requireUser } from "@/lib/auth";
import { rateLimit, verifyCsrf } from "@/lib/security";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const maxSize = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function missingCloudinaryConfig() {
  if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) return "Missing Cloudinary cloud name.";
  if (!process.env.CLOUDINARY_API_KEY?.trim()) return "Missing Cloudinary API key.";
  if (!process.env.CLOUDINARY_API_SECRET?.trim()) return "Missing Cloudinary API secret.";
  return null;
}

function isCloudinaryAuthFailure(error: unknown) {
  const candidate = error as { http_code?: number; message?: string };
  return candidate.http_code === 401 || /auth|api key|signature|credentials/i.test(candidate.message ?? "");
}

export async function POST(request: Request) {
  try {
    await rateLimit("image-upload", 20, 60_000);
    await verifyCsrf(request);
    const formData = await request.formData();
    const file = formData.get("file");
    const scope = formData.get("scope");
    if (!(file instanceof File) || (scope !== "product" && scope !== "community")) {
      return NextResponse.json({ error: "Invalid image upload request." }, { status: 400 });
    }
    if (scope === "product") {
      await requireAdmin();
    } else {
      await requireUser();
    }
    const configError = missingCloudinaryConfig();
    if (configError) {
      return NextResponse.json({ error: configError }, { status: 503 });
    }
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed." }, { status: 400 });
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Image must be 5MB or smaller." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    let uploaded;
    try {
      uploaded = await uploadImageToCloudinary(buffer, `sacred-spices/${scope}`);
    } catch (uploadError) {
      const errorDetails = uploadError as { http_code?: number; name?: string };
      console.error("Cloudinary upload failed", {
        scope,
        httpCode: errorDetails.http_code ?? null,
        errorName: errorDetails.name ?? "CloudinaryUploadError"
      });
      if (isCloudinaryAuthFailure(uploadError)) {
        return NextResponse.json({ error: "Cloudinary auth failed. Check cloud name, API key, and API secret." }, { status: 502 });
      }
      return NextResponse.json({ error: "Cloudinary upload failed. Please try again." }, { status: 502 });
    }

    return NextResponse.json({
      provider: "cloudinary",
      secureUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height
    });
  } catch (error) {
    return handleApiError(error);
  }
}
