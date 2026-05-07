import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
export function Grid({
  cols = 12,
  gap = 6,
  className,
  children,
}: {
  cols?: number;
  gap?: 4 | 5 | 6 | 7;
  className?: string;
  children: ReactNode;
}) {
  const colMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    6: "grid-cols-6",
    12: "grid-cols-12",
  };
  const gapMap: Record<number, string> = { 4: "gap-4", 5: "gap-5", 6: "gap-6", 7: "gap-7" };
  return (
    <div className={cn("grid", colMap[cols] ?? "grid-cols-12", gapMap[gap], className)}>
      {children}
    </div>
  );
}
