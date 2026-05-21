import { cn } from "@/shared/lib";

/**
 * Кругла монограма з першою літерою імені.
 * Розмір, фон і розмір тексту задає викликач через `className` —
 * компонент володіє лише версткою кола й сімейством шрифту.
 */
export function AccountMonogram({ initial, className }: { initial: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-full font-display font-bold leading-none",
        className,
      )}
    >
      {initial}
    </span>
  );
}
