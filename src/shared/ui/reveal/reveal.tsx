"use client";
import { useRef, type ReactNode } from "react";
import { useIntersection } from "@/shared/hooks/use-intersection";
import { cn } from "@/shared/lib";

type RevealProps = {
  children: ReactNode;
  /** Каскадна затримка входу (stagger) — мс. Для сіток: `(i % колонки) * 60`. */
  delayMs?: number;
  className?: string;
};

/**
 * Прокрутковий вхід: контент проявляється (opacity + лагідний підйом на 16px)
 * щойно потрапляє у viewport, один раз. `prefers-reduced-motion` лишає тільки fade
 * (рух прибрано через `motion-reduce:translate-y-0`).
 */
export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // rootMargin -10% знизу — секція «доїжджає» трохи раніше повного перетину.
  const seen = useIntersection(ref, {
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-d4 ease-paper motion-reduce:translate-y-0",
        seen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
