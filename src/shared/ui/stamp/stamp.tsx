"use client";
import { useRef, type CSSProperties, type MouseEventHandler } from "react";
import { cn } from "@/shared/lib";
import { useIntersection } from "@/shared/hooks/use-intersection";
import type { StampText, StampShape, StampRotation, StampColor, StampAnimateOn } from "./types";

export type StampProps = {
  text: StampText;
  shape?: StampShape;
  size?: number;
  rotation?: StampRotation;
  color?: StampColor;
  animateOn?: StampAnimateOn;
  smudge?: boolean;
  trail?: boolean;
  delayMs?: number;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export function Stamp({
  text,
  shape = "circle",
  size = 110,
  rotation = -8,
  color = "burgundy",
  animateOn = "scroll",
  smudge = true,
  trail = false,
  delayMs = 0,
  className,
  onClick,
}: StampProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useIntersection(ref, { threshold: 0.4, once: true });
  const shouldAnimate = animateOn === "load" || (animateOn === "scroll" && inView);

  const style: CSSProperties = {
    "--final-rotation": `${rotation}deg`,
    width: size,
    height: size,
    animationDelay: delayMs ? `${delayMs}ms` : undefined,
    color: color === "burgundy" ? "var(--c-stamp)" : "var(--c-ink)",
  } as CSSProperties;

  const interactive = !!onClick;
  return (
    <div
      ref={ref}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      data-cursor={interactive ? "arrow" : undefined}
      data-smudge={smudge}
      data-trail={trail}
      data-animate-on={animateOn}
      className={cn(
        "stamp relative inline-flex select-none items-center justify-center",
        shouldAnimate && "animate-stamp-drop",
        interactive && "cursor-pointer",
        className,
      )}
      style={style}
    >
      <StampShapeSvg shape={shape} />
      <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-display text-[11px] font-bold uppercase leading-tight tracking-[0.06em]">
        {text}
      </span>
    </div>
  );
}

function StampShapeSvg({ shape }: { shape: StampShape }) {
  const fid = `stamp-displace-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox="0 0 110 110" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} />
          <feDisplacementMap in="SourceGraphic" scale={2.5} />
        </filter>
      </defs>
      {shape === "circle" && (
        <circle
          cx="55"
          cy="55"
          r="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          filter={`url(#${fid})`}
        />
      )}
      {shape === "octagon" && (
        <polygon
          points="33,5 77,5 105,33 105,77 77,105 33,105 5,77 5,33"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          filter={`url(#${fid})`}
        />
      )}
      {shape === "rect" && (
        <rect
          x="6"
          y="20"
          width="98"
          height="70"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          filter={`url(#${fid})`}
        />
      )}
      {shape === "soft" && (
        <rect
          x="10"
          y="10"
          width="90"
          height="90"
          rx="20"
          ry="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          filter={`url(#${fid})`}
        />
      )}
    </svg>
  );
}
