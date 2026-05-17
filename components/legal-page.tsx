import { PageShell } from "@/components/brand-shell";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updatedAt: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  children?: React.ReactNode;
};

export function LegalPage({ eyebrow, title, updatedAt, intro, sections, children }: LegalPageProps) {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">{eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-ivory sm:text-6xl">{title}</h1>
          <p className="mt-4 text-sm text-ivory/52">Last updated: {updatedAt}</p>
          <p className="mt-6 text-lg leading-8 text-ivory/74">{intro}</p>
          {children ? <div className="mt-8">{children}</div> : null}
          <div className="mt-10 grid gap-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-lg border border-turmeric/16 bg-charcoal p-6">
                <h2 className="font-display text-3xl text-ivory">{section.title}</h2>
                <p className="mt-3 leading-7 text-ivory/68">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
