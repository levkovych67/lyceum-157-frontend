import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
const gapMap = { 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6", 7: "gap-7" } as const;
export function Stack({
  gap = 5,
  className,
  children,
}: {
  gap?: keyof typeof gapMap;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("flex flex-col", gapMap[gap], className)}>{children}</div>;
}
