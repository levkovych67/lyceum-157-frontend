import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
export function FormFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex items-center justify-between pt-4", className)}>{children}</div>;
}
