export function Section({
  eyebrow,
  title,
  copy,
  children
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.28em] text-saffron">{eyebrow}</p> : null}
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-ivory sm:text-5xl">{title}</h2>
          {copy ? <p className="mt-5 text-base leading-8 text-ivory/68 sm:text-lg">{copy}</p> : null}
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
