"use client";
import Image from "next/image";
import { cn } from "@/shared/lib";
import { PaperClip } from "@/shared/ui/paper-clip";

export type PolaroidProps = {
  src: string;
  alt: string;
  caption?: string;
  rotation?: -7 | -5 | -3 | -1 | 2 | 4 | 6;
  ratio?: "4/5" | "1/1";
  paperClip?: boolean;
  hoverInteractive?: boolean;
  className?: string;
  blurDataURL?: string;
};
export function Polaroid({
  src,
  alt,
  caption,
  rotation = -3,
  ratio = "4/5",
  paperClip,
  hoverInteractive = true,
  className,
  blurDataURL,
}: PolaroidProps) {
  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn(
        "relative inline-block bg-white p-3 pb-9 shadow-photo transition-transform duration-d3 ease-spring",
        hoverInteractive && "hover:rotate-0 hover:scale-[1.04]",
        className,
      )}
    >
      {paperClip && <PaperClip className="absolute -top-3 right-6" />}
      <div
        className={cn(
          "relative overflow-hidden",
          ratio === "4/5" ? "aspect-[4/5] w-60" : "aspect-square w-60",
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="240px"
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          className="object-cover"
        />
      </div>
      {caption && <p className="mt-3 text-center font-hand text-hand-s text-ink">{caption}</p>}
    </div>
  );
}
