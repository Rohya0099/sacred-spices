import { v2 as cloudinary } from "cloudinary";
import { assertEnv } from "@/lib/security";

export function getCloudinaryConfig() {
  const cloudName = assertEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = assertEnv("CLOUDINARY_API_KEY");
  const apiSecret = assertEnv("CLOUDINARY_API_SECRET");
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  return { cloudName, apiKey, apiSecret };
}

export function signCloudinaryUpload(folder: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    folder,
    timestamp
  };
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);
  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature
  };
}

export async function uploadImageToCloudinary(buffer: Buffer, folder: string) {
  getCloudinaryConfig();
  return new Promise<{
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        overwrite: false,
        unique_filename: true
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height
        });
      }
    );
    stream.end(buffer);
  });
}
