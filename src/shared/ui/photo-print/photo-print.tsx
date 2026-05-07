"use client";
import Image from "next/image";
import { cn } from "@/shared/lib";
import { PaperClip } from "@/shared/ui/paper-clip";

export type PhotoPrintProps = {
  src: string;
  alt: string;
  ratio?: "4/5" | "3/4" | "1/1" | "16/9";
  paperClip?: boolean;
  grainy?: boolean;
  className?: string;
};
const ratioMap = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
} as const;
export function PhotoPrint({
  src,
  alt,
  ratio = "4/5",
  paperClip,
  grainy = true,
  className,
}: PhotoPrintProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[4px] shadow-photo",
        ratioMap[ratio],
        grainy && "photo-grainy",
        className,
      )}
    >
      {paperClip && <PaperClip className="absolute -top-3 right-6 z-10" />}
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}
