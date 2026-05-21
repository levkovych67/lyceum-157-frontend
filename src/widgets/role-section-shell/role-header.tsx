"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { roleNav, roleTitle, type RoleNavItem } from "./role-nav-config";

function isActive(pathname: string, item: RoleNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function RoleHeader({ role }: { role: "student" | "admin" }) {
  const pathname = usePathname() ?? "/";
  const items = roleNav[role];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-glass shadow-paper backdrop-blur-md">
      <Container>
        {/* рядок 1 — бренд + вихід на сайт */}
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-ink transition-colors duration-d2 ease-paper hover:text-burgundy"
          >
            <Image
              src="/logo.webp"
              alt="Майстерня 157"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-lead italic">{roleTitle[role]}</span>
          </Link>
          <Link
            href="/"
            className="text-small font-bold uppercase tracking-[0.1em] text-ink transition-colors duration-d2 ease-paper hover:text-burgundy"
          >
            ← На сайт
          </Link>
        </div>
        {/* рядок 2 — навігація розділів кабінету */}
        <nav aria-label="Розділи кабінету" className="border-t border-line">
          <ul className="flex gap-1 overflow-x-auto">
            {items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block whitespace-nowrap border-b-2 px-3 py-2.5",
                      "text-small font-bold uppercase tracking-[0.1em]",
                      "transition-colors duration-d2 ease-paper",
                      active
                        ? "border-burgundy text-burgundy"
                        : "border-transparent text-ink hover:text-burgundy",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
