"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";
import { TopBar } from "./top-bar";
import { Nav } from "./nav";
import { CartBadge } from "./cart-badge";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib";
import Image from "next/image";

export function Header() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      data-collapsed={collapsed}
      className={cn(
        "bg-bg/90 fixed left-0 right-0 top-0 z-30 border-b border-line backdrop-blur-md transition-all duration-d3 ease-paper",
        collapsed ? "h-16 shadow-paper" : "h-[88px] md:h-[124px]",
      )}
    >
      <div
        className={cn(
          "overflow-hidden transition-all duration-d3 ease-paper",
          collapsed ? "h-0 opacity-0" : "h-9 opacity-100",
        )}
      >
        <TopBar />
      </div>
      <Container>
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-d3 ease-paper",
            collapsed ? "h-16" : "h-[88px]",
          )}
        >
          <Link
            href="/"
            className="relative flex items-center justify-center transition-all duration-d3 ease-paper"
          >
            <Image
              src="/logo.webp"
              alt="Майстерня 157"
              width={80}
              height={80}
              className={cn(
                "object-contain transition-all duration-d3 ease-paper",
                collapsed ? "h-12 w-12" : "h-20 w-20",
              )}
            />
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
