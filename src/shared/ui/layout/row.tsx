import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
const gapMap = { 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6", 7: "gap-7" } as const;
const alignMap = { start: "items-start", center: "items-center", end: "items-end" } as const;
const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;
export function Row({
  gap = 4,
  align = "center",
  justify = "start",
  className,
  children,
}: {
  gap?: keyof typeof gapMap;
  align?: keyof typeof alignMap;
  justify?: keyof typeof justifyMap;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex", gapMap[gap], alignMap[align], justifyMap[justify], className)}>
      {children}
    </div>
  );
}
