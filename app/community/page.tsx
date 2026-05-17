import { Camera, MessageCircle, Utensils } from "lucide-react";
import { PageShell } from "@/components/brand-shell";
import { CommunityPostForm } from "@/components/community-post-form";

const prompts = [
  ["Share recipes", "Post how a masala lives inside your everyday cooking.", Utensils],
  ["Family food stories", "Preserve memories from parents, grandparents, festivals, and regional homes.", MessageCircle],
  ["Cooking photos", "Upload real kitchen moments, plated dishes, and seasonal food traditions.", Camera]
];

export default function CommunityPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">Sacred Kitchen Community</p>
          <h1 className="mt-4 max-w-4xl font-display text-6xl font-semibold leading-tight text-ivory">
            A home for recipes, memories, and cultural food traditions.
          </h1>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {prompts.map(([title, copy, Icon]) => (
              <div key={title as string} className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
                <Icon className="text-saffron" size={25} />
                <h2 className="mt-5 font-display text-3xl text-ivory">{title as string}</h2>
                <p className="mt-3 text-sm leading-6 text-ivory/62">{copy as string}</p>
              </div>
            ))}
          </div>
          <CommunityPostForm />
          <div className="mt-8 rounded-lg border border-dashed border-turmeric/24 bg-charcoal/60 p-8 text-center">
            <p className="font-display text-3xl text-ivory">No community posts yet</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ivory/60">
              Empty state ready for launch. Connect authentication and storage to accept recipe text, family stories, and cooking photos.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
