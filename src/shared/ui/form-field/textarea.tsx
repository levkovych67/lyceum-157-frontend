"use client";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full resize-y rounded-md border border-line bg-bg-card p-4 text-body text-ink placeholder:text-ink-fade",
        "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-burgundy",
        "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error",
        className,
      )}
      {...rest}
    />
  );
});
