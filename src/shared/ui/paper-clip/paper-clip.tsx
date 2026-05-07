import { cn } from "@/shared/lib";
export type PaperClipProps = { className?: string; rotation?: number };
export function PaperClip({ className, rotation = -8 }: PaperClipProps) {
  return (
    <svg
      width="32"
      height="56"
      viewBox="0 0 32 56"
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn("drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="clip-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--c-metal-base)" />
          <stop offset="50%" stopColor="var(--c-metal-shine)" />
          <stop offset="100%" stopColor="var(--c-metal-shade)" />
        </linearGradient>
      </defs>
      <path
        d="M8 4 Q4 4 4 8 L4 48 Q4 52 8 52 L24 52 Q28 52 28 48 L28 12 Q28 8 24 8 L12 8 Q8 8 8 12 L8 44"
        fill="none"
        stroke="url(#clip-grad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
