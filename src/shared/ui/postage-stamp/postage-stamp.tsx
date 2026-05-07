import { cn } from "@/shared/lib";

export type PostageStampProps = { className?: string; size?: number };
export function PostageStamp({ className, size = 120 }: PostageStampProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-burgundy text-white shadow-paper",
        className,
      )}
      style={{
        width: size,
        height: (size * 140) / 120,
        clipPath:
          "polygon(0% 5%,5% 0%,15% 5%,25% 0%,35% 5%,45% 0%,55% 5%,65% 0%,75% 5%,85% 0%,95% 5%,100% 15%,95% 25%,100% 35%,95% 45%,100% 55%,95% 65%,100% 75%,95% 85%,100% 95%,85% 100%,75% 95%,65% 100%,55% 95%,45% 100%,35% 95%,25% 100%,15% 95%,5% 100%,0% 95%,5% 85%,0% 75%,5% 65%,0% 55%,5% 45%,0% 35%,5% 25%,0% 15%)",
      }}
    >
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r="22" fill="none" stroke="white" strokeWidth="1.5" />
        <text
          x="28"
          y="34"
          textAnchor="middle"
          fill="white"
          fontFamily="serif"
          fontSize="14"
          fontStyle="italic"
        >
          157
        </text>
      </svg>
      <p className="mt-1 font-display italic" style={{ fontSize: 11 }}>
        УКРАЇНА · 1957–2026
      </p>
    </div>
  );
}
