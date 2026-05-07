"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib";

const pill = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill font-body font-semibold tracking-tight transition-colors duration-d3 ease-paper disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-burgundy text-white hover:bg-green",
        "outline-d": "border border-burgundy text-burgundy hover:bg-burgundy hover:text-white",
        "outline-l": "border border-white text-white hover:bg-white hover:text-burgundy",
        ghost: "bg-transparent text-burgundy hover:text-burgundy-deep",
      },
      size: {
        s: "h-9 px-4 text-small",
        m: "h-12 px-6 text-body",
        l: "h-14 px-7 text-body",
        xl: "h-16 px-8 text-lead",
      },
    },
    defaultVariants: { variant: "primary", size: "m" },
  },
);

export type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof pill> & {
    asChild?: boolean;
    loading?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  };

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(function PillButton(
  { className, variant, size, asChild, loading, startIcon, endIcon, disabled, children, ...rest },
  ref,
) {
  const classes = cn(pill({ variant, size }), className);
  if (asChild) {
    // Radix Slot requires a single React element child. Icons + loading state are
    // not supported in asChild mode (use a regular <PillButton> with onClick instead).
    return (
      <Slot ref={ref as never} data-cursor="arrow" className={classes} {...rest}>
        {children as React.ReactElement}
      </Slot>
    );
  }
  return (
    <button
      ref={ref}
      data-cursor="arrow"
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading ? <Spinner /> : startIcon}
      <span>{children}</span>
      {endIcon}
    </button>
  );
});

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}
