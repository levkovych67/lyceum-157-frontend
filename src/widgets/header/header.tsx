"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";
import { TopBar } from "./top-bar";
import { Nav } from "./nav";
import { CartBadge } from "./cart-badge";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib";

export function Header() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 z-30 backdrop-blur-md transition-[height] duration-d3 ease-paper",
        "bg-bg/90 border-b border-line",
      )}
    >
      {!collapsed && <TopBar />}
      <Container>
        <div
          className={cn(
            "flex items-center justify-between transition-all",
            collapsed ? "h-16" : "h-[88px]",
          )}
        >
          <Link href="/" className="font-display text-h3 font-bold text-burgundy">
            <span aria-hidden className="mr-3 inline-block h-7 w-7 rounded-full bg-burgundy" />
            Майстерня 157
          </Link>
          <Nav />
          <div className="flex items-center gap-5">
            <Search size={20} strokeWidth={1.5} aria-label="Пошук" />
            <Link href="/account" aria-label="Кабінет">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <CartBadge />
          </div>
        </div>
      </Container>
    </header>
  );
}
