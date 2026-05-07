import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
export function FormRow({
  cols = 1,
  className,
  children,
}: {
  cols?: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  const colMap = { 1: "grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" } as const;
  return <div className={cn("grid gap-5", colMap[cols], className)}>{children}</div>;
}
