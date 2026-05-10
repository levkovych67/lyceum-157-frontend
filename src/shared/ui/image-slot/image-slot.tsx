import Image from "next/image";
import { cn } from "@/shared/lib";

export type ImageSlotVariant =
  | "polaroid"
  | "photo-print"
  | "interlude"
  | "portrait"
  | "stamp"
  | "plain";

export type ImageSlotRatio = "3/4" | "4/5" | "16/9" | "1/1" | "21/9" | "3/2";

export type ImageSlotProps = {
  slot: string;
  ratio: ImageSlotRatio;
  variant: ImageSlotVariant;
  caption: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  blurDataURL?: string;
};

const variantStyles: Record<ImageSlotVariant, string> = {
  polaroid: "bg-white p-3 pb-9 shadow-photo rounded-[2px]",
  "photo-print": "rounded-[4px] shadow-photo",
  interlude: "rounded-none",
  portrait: "rounded-[4px] shadow-photo",
  stamp: "rounded-md border-2 border-dashed border-burgundy/60",
  plain: "rounded-[2px]",
};

const placeholderRingByVariant: Record<ImageSlotVariant, string> = {
  polaroid: "border-2 border-dashed border-burgundy/60",
  "photo-print": "border-2 border-dashed border-burgundy/60",
  interlude: "border-2 border-dashed border-burgundy/60",
  portrait: "border-2 border-dashed border-burgundy/60",
  stamp: "",
  plain: "border-2 border-dashed border-burgundy/60",
};

export function ImageSlot({
  slot,
  ratio,
  variant,
  caption,
  src,
  alt,
  priority,
  sizes,
  className,
  blurDataURL,
}: ImageSlotProps) {
  const aspectStyle = { aspectRatio: ratio.replace("/", " / ") };

  if (src) {
    if (variant === "polaroid") {
      return (
        <div className={cn("inline-block rounded-[2px] bg-white p-3 pb-9 shadow-photo", className)}>
          <div className="relative overflow-hidden rounded-[1px]" style={aspectStyle}>
            <Image
              src={src}
              alt={alt ?? caption}
              fill
              sizes={sizes ?? "100vw"}
              priority={priority}
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
              className="object-cover"
            />
          </div>
        </div>
      );
    }

    if (variant === "stamp") {
      return (
        <div className={cn("border-burgundy/60 rounded-md border-2 border-dashed p-1", className)}>
          <div className="relative overflow-hidden rounded-md" style={aspectStyle}>
            <Image
              src={src}
              alt={alt ?? caption}
              fill
              sizes={sizes ?? "100vw"}
              priority={priority}
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
              className="object-cover"
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn("relative overflow-hidden", variantStyles[variant], className)}
        style={aspectStyle}
      >
        <Image
          src={src}
          alt={alt ?? caption}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${caption} (placeholder)`}
      data-slot={slot}
      data-variant={variant}
      data-ratio={ratio}
      style={aspectStyle}
      className={cn(
        "relative flex w-full flex-col items-center justify-center bg-bg-warm bg-paper-noise",
        placeholderRingByVariant[variant],
        variantStyles[variant],
        variant !== "polaroid" && variant !== "stamp" && "overflow-hidden",
        className,
      )}
      title={`Покласти файл: public/images/${slot}`}
    >
      <span className="bg-ink/80 absolute left-2 top-2 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-bg-warm">
        {slot}
      </span>
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className="stroke-ink/50 h-12 w-12"
        fill="none"
        strokeWidth="1.5"
      >
        <line x1="4" y1="4" x2="60" y2="60" />
        <line x1="60" y1="4" x2="4" y2="60" />
        <line x1="32" y1="4" x2="32" y2="60" />
        <line x1="4" y1="32" x2="60" y2="32" />
      </svg>
      <p className="text-ink/70 mt-3 max-w-[80%] text-center font-display text-small italic">
        {caption}
      </p>
      <p className="text-ink/50 mt-1 font-mono text-[10px] uppercase tracking-wider">
        <span>{ratio}</span>
        <span aria-hidden> · </span>
        <span>{variant}</span>
      </p>
    </div>
  );
}
