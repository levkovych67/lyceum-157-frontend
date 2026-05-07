import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
export function Container({
  narrow,
  className,
  children,
}: {
  narrow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 md:px-6",
        narrow ? "max-w-[920px]" : "max-w-[1280px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
