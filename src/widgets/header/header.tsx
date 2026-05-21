"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, User, Menu, X } from "lucide-react";
import { TopBar } from "./top-bar";
import { Nav } from "./nav";
import { CartBadge } from "./cart-badge";
import { useHeaderState } from "./use-header-state";
import { Container, Stamp } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { usePathname } from "next/navigation";
import { toneForPath } from "./header-tone";

const navItems = [
  { href: "/catalog", label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about", label: "Про проєкт" },
];

export function Header() {
  const { floating } = useHeaderState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  // У rest-стані на темних маршрутах хедер «зливається» з фото-hero — кремові елементи.
  const dark = !floating && toneForPath(pathname) === "dark";

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      data-floating={floating}
      className={cn(
        "fixed left-0 right-0 top-0 z-30 border-b transition-all duration-d3 ease-paper",
        floating
          ? "h-16 border-line bg-glass shadow-paper backdrop-blur-md"
          : "h-[88px] border-transparent bg-transparent md:h-[124px]",
      )}
    >
      <div
        className={cn(
          "overflow-hidden transition-all duration-d3 ease-paper",
          floating ? "h-0 opacity-0" : "h-9 opacity-100",
        )}
      >
        <TopBar />
      </div>
      <Container>
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-d3 ease-paper",
            floating ? "h-16" : "h-[88px]",
          )}
        >
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={cn(
              "-ml-2 p-2 transition-colors md:hidden",
              dark ? "text-bg-warm hover:text-white" : "text-ink hover:text-burgundy",
            )}
            aria-label="Відкрити меню"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo - Centered on mobile, Left-aligned on desktop */}
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center transition-all duration-d3 ease-paper md:static md:translate-x-0"
          >
            <Image
              src="/logo.webp"
              alt="Майстерня 157"
              width={80}
              height={80}
              priority
              className={cn(
                "object-contain transition-all duration-d3 ease-paper",
                floating ? "h-10 w-10 md:h-12 md:w-12" : "h-16 w-16 md:h-20 md:w-20",
              )}
            />
          </Link>

          {/* Desktop Nav */}
          <Nav tone={dark ? "dark" : "light"} />

          {/* Global Icons */}
          <div
            className={cn("flex items-center gap-4 md:gap-5", dark ? "text-bg-warm" : "text-ink")}
          >
            <Search
              size={20}
              strokeWidth={1.5}
              className="hidden cursor-pointer transition-colors hover:text-burgundy sm:block"
              aria-label="Пошук"
            />
            <Link
              href="/account"
              className="hidden transition-colors hover:text-burgundy sm:block"
              aria-label="Кабінет"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
            <CartBadge />
          </div>
        </div>
      </Container>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-d3"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 flex w-full max-w-[300px] flex-col justify-between border-r border-line bg-bg p-6 shadow-deep transition-transform duration-d3 ease-paper",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex flex-col">
                  <span className="-rotate-2 font-hand text-hand-m text-green">зміст випуску</span>
                  <span className="font-body text-[10px] uppercase tracking-widest text-ink-fade">
                    Архів 157
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-2 text-ink transition-colors hover:bg-line"
                  aria-label="Закрити меню"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-8">
                <ul className="flex flex-col gap-6">
                  {navItems.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="font-display text-h2 italic text-burgundy transition-colors hover:text-green"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Drawer Footer with Stamp decoration */}
            <div className="flex flex-col items-center gap-4 border-t border-line pt-6">
              <Stamp
                text="1957"
                shape="octagon"
                rotation={-5}
                size={64}
                animateOn="none"
                smudge={true}
                className="text-burgundy/20"
              />
              <p className="text-center font-body text-[10px] uppercase tracking-[0.15em] text-ink-fade">
                ВИПУСК №47 · ТРАВЕНЬ 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
