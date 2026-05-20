import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
const tone = {
  bg: "bg-bg",
  warm: "bg-bg-warm",
  noir: "bg-bg-noir text-white",
  card: "bg-bg-card",
} as const;
const pad = {
  default: "py-16 md:py-[120px]",
  tight: "py-10 md:py-16",
  wide: "py-20 md:py-[160px]",
  page: "pt-6 pb-8 md:pt-7 md:pb-9",
} as const;
export function Section({
  tone: t = "bg",
  pad: p = "default",
  className,
  children,
}: {
  tone?: keyof typeof tone;
  pad?: keyof typeof pad;
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn("relative", tone[t], pad[p], className)}>{children}</section>;
}
