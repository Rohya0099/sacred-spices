import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ivory/46">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-saffron">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-saffron" : undefined}>{item.label}</span>
            )}
            {!isLast ? <span className="text-turmeric/45">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
