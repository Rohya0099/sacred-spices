"use client";

import { useState } from "react";
import { Camera, Send } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { csrfFetch } from "@/lib/client-security";

export function CommunityPostForm() {
  const [images, setImages] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const response = await csrfFetch("/api/community-posts", {
      method: "POST",
      body: JSON.stringify({
        title: formData.get("title"),
        body: formData.get("body"),
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        images
      })
    });
    const json = await response.json();
    setLoading(false);
    setMessage(response.ok ? "Story submitted for moderation." : json.error ?? "Could not submit story.");
    if (response.ok) setImages([]);
  }

  return (
    <form action={submit} className="mt-8 grid gap-4 rounded-lg border border-turmeric/16 bg-charcoal p-6">
      <div className="flex items-center gap-3">
        <Camera className="text-saffron" />
        <h2 className="font-display text-3xl text-ivory">Share from your kitchen</h2>
      </div>
      <input name="title" placeholder="Recipe or memory title" required className="field" />
      <textarea name="body" placeholder="Tell the story behind the dish" required rows={5} className="field resize-none" />
      <input name="tags" placeholder="Tags, comma separated" className="field" />
      <ImageUpload scope="community" value={images} onChange={setImages} />
      {message ? <p className="rounded-lg border border-turmeric/16 bg-obsidian p-3 text-sm text-ivory/68">{message}</p> : null}
      <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-5 py-3 font-semibold text-obsidian disabled:cursor-wait disabled:opacity-70">
        <Send size={17} />
        {loading ? "Submitting..." : "Submit for moderation"}
      </button>
    </form>
  );
}
