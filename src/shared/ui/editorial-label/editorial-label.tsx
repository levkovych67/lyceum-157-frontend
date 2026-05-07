import { cn } from "@/shared/lib";
import type { ReactNode, ElementType } from "react";

export type EditorialLabelProps = {
  children: ReactNode;
  color?: "green" | "burgundy" | "white";
  as?: ElementType;
  className?: string;
};

const colorMap = {
  green: "text-green before:bg-green",
  burgundy: "text-burgundy before:bg-burgundy",
  white: "text-white before:bg-white",
} as const;

export function EditorialLabel({
  children,
  color = "green",
  as: Tag = "span",
  className,
}: EditorialLabelProps) {
  return (
    <Tag
      className={cn(
        "relative inline-flex items-center pl-3 font-body text-label uppercase",
        "before:absolute before:left-0 before:top-1/2 before:h-4 before:w-1 before:-translate-y-1/2",
        colorMap[color],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
