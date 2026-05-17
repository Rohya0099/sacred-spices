"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/checkout") return pathname === "/checkout";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ActiveNavLinks({ items, mobile = false }: { items: NavItem[]; mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              mobile
                ? `shrink-0 border-b-2 pb-2 transition ${active ? "border-saffron text-saffron drop-shadow-[0_0_10px_rgba(243,165,31,0.35)]" : "border-transparent hover:text-saffron"}`
                : `relative transition after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-saffron after:transition ${
                    active ? "text-saffron drop-shadow-[0_0_10px_rgba(243,165,31,0.35)] after:scale-x-100" : "hover:text-saffron after:scale-x-0 hover:after:scale-x-100"
                  }`
            }
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
