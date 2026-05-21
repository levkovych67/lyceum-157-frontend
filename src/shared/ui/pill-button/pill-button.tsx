"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-none font-body font-bold uppercase " +
    "tracking-[0.08em] transition-[transform,box-shadow,background-color,border-color,color] " +
    "duration-d2 ease-paper disabled:cursor-not-allowed disabled:opacity-45 " +
    "disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none",
  {
    variants: {
      variant: {
        // Друкований блок — заливка, жорстка зміщена тінь, вдавлюється у тінь при hover.
        primary:
          "bg-burgundy text-white shadow-press hover:bg-green " +
          "hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-press-sm " +
          "active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
        // Чорнильний контур (вторинна) — прозора, бордовий бордюр, тонка зміщена тінь.
        "outline-d":
          "border-2 border-burgundy bg-transparent text-burgundy shadow-press-sm " +
          "hover:border-green hover:bg-green hover:text-white " +
          "hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none " +
          "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        // Контур для темного тла — кремовий, без зміщеної тіні.
        "outline-l":
          "border-2 border-white bg-transparent text-white " +
          "hover:bg-white hover:text-burgundy active:scale-[0.97]",
        // Текстова — без рамки й тіні.
        ghost: "bg-transparent text-burgundy hover:text-green active:scale-[0.97]",
      },
      size: {
        s: "h-9 px-5 text-small",
        m: "h-12 px-7 text-small",
        l: "h-14 px-8 text-body",
        xl: "h-16 px-10 text-body",
      },
    },
    defaultVariants: { variant: "primary", size: "m" },
  },
);

export type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & {
    asChild?: boolean;
    loading?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  };

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(function PillButton(
  { className, variant, size, asChild, loading, startIcon, endIcon, disabled, children, ...rest },
  ref,
) {
  const classes = cn(button({ variant, size }), className);
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
