import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib";

export type InputVariant = "box" | "underline";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { variant?: InputVariant };

const variants: Record<InputVariant, string> = {
  // Стандартне поле — біла картка з рамкою, фокус-кільце.
  box:
    "h-14 rounded-md border border-line bg-bg-card px-4 " +
    "focus:border-transparent focus:ring-2 focus:ring-burgundy " +
    "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error",
  // «Бібліотечне» поле — чітка нижня лінія (видно куди вводити), бордовий focus.
  underline:
    "h-12 rounded-none border-0 border-b-2 border-ink-soft bg-transparent px-0 " +
    "transition-colors duration-d2 hover:border-ink " +
    "focus:border-burgundy aria-[invalid=true]:border-error",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, variant = "box", ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full text-body text-ink placeholder:text-ink-fade focus:outline-none",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
});
