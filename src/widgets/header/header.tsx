"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, Menu } from "lucide-react";
import { TopBar } from "./top-bar";
import { Nav } from "./nav";
import { CartBadge } from "./cart-badge";
import { MobileDrawer } from "./mobile-drawer";
import { useHeaderState } from "./use-header-state";
import { AccountControl } from "./account-control";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { usePathname } from "next/navigation";
import { toneForPath } from "./header-tone";

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
              "-ml-2 p-2 transition-[color,transform] duration-d1 ease-paper active:scale-90 md:hidden",
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
            <AccountControl dark={dark} />
            <CartBadge />
          </div>
        </div>
      </Container>

      {/* Mobile Menu Drawer */}
      <MobileDrawer open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}
