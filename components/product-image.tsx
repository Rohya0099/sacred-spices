"use client";

import Image from "next/image";
import { useState } from "react";
import { Sparkles } from "lucide-react";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

const fallbackSrc = "/images/products/mango-pickle.jpg";

export function ProductImage({ src, alt, fill, priority, className, sizes, width, height }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-charcoal to-obsidian text-center">
        <div>
          <Sparkles className="mx-auto text-saffron" size={28} />
          <p className="mt-3 font-display text-2xl text-ivory">Sacred Spices</p>
        </div>
      </div>
    );
  }

  const imageSrc = failed ? fallbackSrc : src;

  return (
    <>
      {!loaded ? <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-charcoal via-obsidian to-charcoal" /> : null}
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        priority={priority}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(false);
        }}
      />
    </>
  );
}
