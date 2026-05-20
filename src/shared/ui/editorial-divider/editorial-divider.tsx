import { cn } from "@/shared/lib";

export type EditorialDividerProps = {
  variant?: "dashed" | "stamp-line" | "number" | "marks";
  number?: number;
  className?: string;
};

export function EditorialDivider({ variant = "dashed", number, className }: EditorialDividerProps) {
  if (variant === "dashed")
    return (
      <hr className={cn("border-ink/40 border-0 border-t-[1.5px] border-dashed", className)} />
    );
  if (variant === "marks")
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <span className="h-4 w-1 bg-burgundy" />
        <span className="h-4 w-1 bg-burgundy" />
        <span className="h-4 w-1 bg-burgundy" />
      </div>
    );
  if (variant === "number")
    return (
      <div className={cn("flex items-center gap-3 text-small text-ink-soft", className)}>
        <span className="h-px flex-1 bg-line-strong" />
        <span className="font-body">{String(number ?? 0).padStart(2, "0")}</span>
        <span className="h-px flex-1 bg-line-strong" />
      </div>
    );
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-line-strong" />
      <span className="text-burgundy">★</span>
      <span className="h-px flex-1 bg-line-strong" />
    </div>
  );
}
