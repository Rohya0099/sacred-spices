"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { ProductImage } from "@/components/product-image";

type ProductPremiumInteractionProps = {
  name: string;
  category: string;
  image?: string | null;
  priority?: boolean;
  compact?: boolean;
  className?: string;
  sizes?: string;
  children?: ReactNode;
};

type ProductMood = "pickle" | "chai" | "gift" | "masala";

function productMood(name: string, category: string): ProductMood {
  const value = `${name} ${category}`.toLowerCase();
  if (value.includes("pickle")) return "pickle";
  if (value.includes("chai")) return "chai";
  if (value.includes("gift") || value.includes("box") || value.includes("festival")) return "gift";
  return "masala";
}

export function ProductPremiumInteraction({
  name,
  category,
  image,
  priority = false,
  compact = false,
  className = "",
  sizes = "(min-width: 1024px) 52vw, 100vw",
  children
}: ProductPremiumInteractionProps) {
  const mood = productMood(name, category);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 18 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [compact ? 2 : 5, compact ? -2 : -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [compact ? -3 : -6, compact ? 3 : 6]);

  return (
    <motion.div
      onPointerMove={(event) => {
        if (reduceMotion || event.pointerType === "touch") return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`group/premium relative isolate overflow-hidden rounded-lg border border-turmeric/16 bg-obsidian shadow-glow ${className}`}
    >
      <MoodAtmosphere mood={mood} compact={compact} reduceMotion={reduceMotion} />
      <motion.div
        animate={reduceMotion ? undefined : { y: compact ? [0, -5, 0] : [0, -14, 0], scale: compact ? [1, 1.006, 1] : [1, 1.015, 1] }}
        transition={{ duration: compact ? 8 : 7, repeat: Infinity, ease: "easeInOut" }}
        className={compact ? "absolute inset-0" : "absolute inset-3 overflow-hidden rounded-lg border border-turmeric/14 bg-charcoal sm:inset-5"}
        style={compact || reduceMotion ? undefined : { transform: "translateZ(34px)" }}
      >
        <ProductImage
          src={image}
          alt={name}
          fill
          priority={priority}
          className="object-cover transition duration-700 motion-safe:group-hover/premium:scale-105"
          sizes={sizes}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/82 via-obsidian/8 to-transparent" />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.16)_38%,transparent_58%)] opacity-0 transition duration-700 motion-safe:group-hover/premium:translate-x-8 motion-safe:group-hover/premium:opacity-100" />
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-20 rounded-[50%] bg-black/35 blur-2xl" />
      {children}
    </motion.div>
  );
}

function MoodAtmosphere({ mood, compact, reduceMotion }: { mood: ProductMood; compact: boolean; reduceMotion: boolean | null }) {
  const intensity = compact ? "opacity-45" : "opacity-80";

  if (mood === "pickle") {
    return (
      <>
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_62%_25%,rgba(236,92,42,0.24),transparent_28rem)] ${intensity}`} />
        <div className="absolute left-8 top-8 h-12 w-32 rotate-[-18deg] rounded-full border border-saffron/20 bg-saffron/10 blur-[1px]" />
        <FloatingBits labels={["mustard", "oil", "mango"]} color="text-ember" compact={compact} reduceMotion={reduceMotion} />
      </>
    );
  }

  if (mood === "chai") {
    return (
      <>
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(250,235,207,0.18),transparent_26rem)] ${intensity}`} />
        <SteamLines compact={compact} reduceMotion={reduceMotion} />
        <FloatingBits labels={["cardamom", "ginger", "clove"]} color="text-sandalwood" compact={compact} reduceMotion={reduceMotion} />
      </>
    );
  }

  if (mood === "gift") {
    return (
      <>
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(243,165,31,0.25),transparent_30rem)] ${intensity}`} />
        <div className="absolute right-5 top-5 rounded-full bg-saffron/15 p-3 text-saffron">
          <Gift size={compact ? 18 : 28} />
        </div>
        <FloatingBits labels={["festival", "gift", "glow"]} color="text-saffron" compact={compact} reduceMotion={reduceMotion} />
      </>
    );
  }

  return (
    <>
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_48%_24%,rgba(243,165,31,0.24),transparent_32rem)] ${intensity}`} />
      <div className="spice-field absolute inset-0 opacity-30" />
      <FloatingBits labels={["roast", "aroma", "spice"]} color="text-turmeric" compact={compact} reduceMotion={reduceMotion} />
    </>
  );
}

function FloatingBits({ labels, color, compact, reduceMotion }: { labels: string[]; color: string; compact: boolean; reduceMotion: boolean | null }) {
  if (compact) {
    return (
      <div className="absolute inset-0">
        {labels.slice(0, 3).map((label, index) => (
          <Sparkles
            key={label}
            size={12}
            className={`absolute ${color} opacity-45`}
            style={{ left: `${18 + index * 28}%`, top: `${16 + index * 16}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {labels.map((label, index) => (
        <motion.span
          key={label}
          animate={reduceMotion ? undefined : { y: [0, -22, 0], opacity: [0.26, 0.62, 0.26] }}
          transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut", delay: index * 0.7 }}
          className={`absolute rounded-full border border-current/20 bg-obsidian/60 px-3 py-1 text-xs uppercase tracking-[0.2em] ${color}`}
          style={{ left: `${18 + index * 24}%`, top: `${16 + index * 18}%` }}
        >
          {label}
        </motion.span>
      ))}
    </div>
  );
}

function SteamLines({ compact, reduceMotion }: { compact: boolean; reduceMotion: boolean | null }) {
  return (
    <>
      {[0, 1].map((item) => (
        <motion.div
          key={item}
          animate={reduceMotion ? undefined : { y: [10, -22, 10], opacity: [0.08, 0.24, 0.08] }}
          transition={{ duration: 5 + item, repeat: Infinity, ease: "easeInOut", delay: item * 1.2 }}
          className="absolute top-6 h-36 w-12 rounded-full bg-ivory/18 blur-2xl"
          style={{ left: compact ? `${40 + item * 18}%` : `${44 + item * 16}%` }}
        />
      ))}
    </>
  );
}
