"use client";
import { useEffect, useState, type CSSProperties } from "react";

export type ConfettiProps = { count?: number; trigger?: boolean; onDone?: () => void };
const palette = ["var(--c-burgundy)", "var(--c-green)", "var(--c-bg-yellow)"];

export function Confetti({ count = 12, trigger, onDone }: ConfettiProps) {
  const [pieces, setPieces] = useState<number[]>([]);
  useEffect(() => {
    if (!trigger) return;
    setPieces(Array.from({ length: count }, (_, i) => i));
    const t = setTimeout(() => {
      setPieces([]);
      onDone?.();
    }, 1200);
    return () => clearTimeout(t);
  }, [trigger, count, onDone]);
  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {pieces.map((i) => {
        const angle = (Math.random() - 0.5) * 120;
        const dx = (Math.random() - 0.5) * 240;
        const color = palette[i % palette.length];
        return (
          <span
            key={i}
            style={
              {
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 8,
                height: 10,
                background: color,
                clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
                animation: "confetti 1200ms cubic-bezier(0.25,1,0.5,1) forwards",
                ["--dx" as never]: `${dx}px`,
                ["--rot" as never]: `${angle}deg`,
              } as CSSProperties
            }
          />
        );
      })}
      <style>{`
        @keyframes confetti {
          0%   { transform: translate(-50%, -50%) rotate(0); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% - 120px)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
