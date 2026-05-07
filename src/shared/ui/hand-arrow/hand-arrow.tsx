"use client";
import { useRef } from "react";
import { cn } from "@/shared/lib";
import { useIntersection } from "@/shared/hooks/use-intersection";

export type HandArrowProps = {
  dir?: "↗" | "↘" | "↖" | "↙";
  size?: "s" | "l";
  color?: "burgundy" | "green";
  drawOnReveal?: boolean;
  className?: string;
};
const rotMap = { "↗": 0, "↘": 90, "↙": 180, "↖": 270 } as const;
const sizeMap = { s: { w: 40, h: 20 }, l: { w: 120, h: 60 } } as const;

export function HandArrow({
  dir = "↗",
  size = "s",
  color = "burgundy",
  drawOnReveal,
  className,
}: HandArrowProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useIntersection(ref as never, { threshold: 0.5 });
  const dim = sizeMap[size];
  const stroke = color === "burgundy" ? "var(--c-burgundy)" : "var(--c-green)";
  return (
    <svg
      ref={ref}
      width={dim.w}
      height={dim.h}
      viewBox="0 0 120 60"
      style={{ transform: `rotate(${rotMap[dir]}deg)` }}
      className={cn(className)}
      aria-hidden
    >
      <path
        d="M5 30 Q40 28 100 30 M85 18 L100 30 L85 42"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={drawOnReveal ? 200 : undefined}
        strokeDashoffset={drawOnReveal ? (inView ? 0 : 200) : undefined}
        style={{ transition: "stroke-dashoffset 600ms var(--ease-paper)" }}
      />
    </svg>
  );
}
