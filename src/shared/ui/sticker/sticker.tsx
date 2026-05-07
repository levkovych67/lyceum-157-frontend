"use client";
import { useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/shared/lib";
import { useIntersection } from "@/shared/hooks/use-intersection";

export type StickerProps = {
  color?: "yellow" | "blue";
  rotation?: number;
  signature?: string;
  children: ReactNode;
  className?: string;
};
export function Sticker({
  color = "yellow",
  rotation = -3,
  signature,
  children,
  className,
}: StickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useIntersection(ref, { threshold: 0.3 });
  return (
    <div
      ref={ref}
      style={{ "--final-rotation": `${rotation}deg` } as CSSProperties}
      className={cn(
        "relative inline-block w-[280px] p-5 shadow-[0_12px_24px_rgba(0,0,0,0.08)]",
        color === "yellow" ? "bg-bg-yellow" : "bg-bg-blue",
        "[clip-path:polygon(0_0,100%_0,100%_100%,12%_100%,0_88%)]",
        inView ? "animate-tilt-into-place" : "opacity-0",
        className,
      )}
    >
      <div className="font-hand text-hand-m text-ink">{children}</div>
      {signature && <p className="mt-3 font-hand text-hand-s text-green">{signature}</p>}
    </div>
  );
}
