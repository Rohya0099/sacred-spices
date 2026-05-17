"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { csrfFetch } from "@/lib/client-security";

const maxSize = 5 * 1024 * 1024;

export function ImageUpload({
  scope,
  value,
  onChange
}: {
  scope: "product" | "community";
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function upload(file: File) {
    setMessage(null);
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > maxSize) {
      setMessage("Image must be 5MB or smaller.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("scope", scope);

    let uploadResponse: Response;
    let uploaded: { error?: string; secureUrl?: string };
    try {
      uploadResponse = await csrfFetch("/api/uploads/images", {
        method: "POST",
        body: formData
      });
      uploaded = await uploadResponse.json();
    } catch {
      setLoading(false);
      setMessage("Image upload failed. Please try again.");
      return;
    }
    setLoading(false);

    if (!uploadResponse.ok) {
      setMessage(uploaded.error ?? "Cloudinary upload failed.");
      return;
    }

    if (!uploaded.secureUrl) {
      setMessage("Cloudinary upload did not return an image URL.");
      return;
    }

    onChange([...value, uploaded.secureUrl]);
    setMessage("Image uploaded.");
  }

  return (
    <div className="rounded-lg border border-turmeric/16 bg-obsidian p-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-turmeric/25 px-4 py-2 text-sm font-semibold text-saffron disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        Upload image
      </button>
      {message ? <p className="mt-3 text-xs text-ivory/56">{message}</p> : null}
      {value.length ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {value.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-turmeric/12">
              <Image src={url} alt="Uploaded preview" fill className="object-cover" sizes="120px" />
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== url))}
                className="absolute right-1 top-1 rounded-full bg-obsidian/80 px-2 py-1 text-xs text-ivory"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
