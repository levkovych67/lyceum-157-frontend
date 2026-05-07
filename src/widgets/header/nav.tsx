"use client";
import Link from "next/link";

const items = [
  { href: "/catalog", label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about", label: "Про" },
];

export function Nav() {
  return (
    <nav className="hidden md:block">
      <ul className="flex gap-7">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="relative text-[13px] font-bold uppercase tracking-[0.08em] text-ink hover:text-green"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
