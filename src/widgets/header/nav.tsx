"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib";

const items = [
  { href: "/catalog", label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about", label: "Про проєкт" },
];

/** Лінка активна, якщо маршрут збігається з її верхнім сегментом. */
function isActive(pathname: string, href: string): boolean {
  const segment = "/" + href.split("/")[1];
  return pathname === segment || pathname.startsWith(segment + "/");
}

export function Nav() {
  const pathname = usePathname() ?? "/";
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);

  const activeIndex = items.findIndex((it) => isActive(pathname, it.href));

  const moveTo = useCallback((index: number) => {
    const list = listRef.current;
    const link = linkRefs.current[index];
    if (!list || !link) return;
    const listRect = list.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    setBox({ left: linkRect.left - listRect.left, width: linkRect.width });
  }, []);

  // Індикатор сідає на активну лінку; пересідає при зміні маршруту / ресайзі.
  useEffect(() => {
    if (activeIndex < 0) {
      setBox(null);
      return;
    }
    moveTo(activeIndex);
    const onResize = () => moveTo(activeIndex);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, moveTo]);

  const settle = () => {
    if (activeIndex >= 0) moveTo(activeIndex);
  };

  return (
    <nav className="hidden md:block">
      <ul ref={listRef} onMouseLeave={settle} className="relative flex gap-2">
        <span
          aria-hidden
          data-nav-indicator="true"
          className={cn(
            "pointer-events-none absolute bottom-1 top-1 rounded-sm border-[1.5px] border-burgundy",
            "transition-[left,width,opacity] duration-d4 ease-paper motion-reduce:transition-none",
            box ? "opacity-100" : "opacity-0",
          )}
          style={box ? { left: box.left, width: box.width } : undefined}
        />
        {items.map((it, i) => (
          <li key={it.href}>
            <Link
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              href={it.href}
              onMouseEnter={() => moveTo(i)}
              className={cn(
                "relative z-10 block px-4 py-2 text-small font-bold uppercase tracking-[0.1em]",
                "transition-colors duration-d3 ease-paper",
                i === activeIndex ? "text-burgundy" : "text-ink hover:text-burgundy",
              )}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
