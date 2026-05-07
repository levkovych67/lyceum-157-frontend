"use client";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-14 w-full rounded-md border border-line bg-bg-card px-4 text-body text-ink placeholder:text-ink-fade",
          "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-burgundy",
          "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error",
          className,
        )}
        {...rest}
      />
    );
  },
);
