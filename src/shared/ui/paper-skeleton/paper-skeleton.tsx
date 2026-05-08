import { cn } from "@/shared/lib";
import { Stamp } from "@/shared/ui/stamp";
import { uk } from "@/shared/i18n";

export type PaperSkeletonProps = {
  variant?: "block" | "line" | "circle";
  ratio?: "4/5" | "1/1" | "16/9" | "3/4";
  width?: string | number;
  height?: string | number;
  className?: string;
};

export function PaperSkeleton({
  variant = "block",
  ratio,
  width,
  height,
  className,
}: PaperSkeletonProps) {
  const style: React.CSSProperties = {
    aspectRatio: ratio?.replace("/", " / "),
    width,
    height,
  };
  if (variant === "line") {
    return (
      <div
        data-testid="paper-skeleton-line"
        style={{ width: width ?? "100%", height: height ?? 12 }}
        className={cn("bg-burgundy/15 rounded-[1px]", className)}
      />
    );
  }
  if (variant === "circle") {
    const size = width ?? height ?? 48;
    return (
      <div
        data-testid="paper-skeleton-circle"
        style={{ width: size, height: size }}
        className={cn(
          "border-burgundy/40 rounded-full border-2 border-dashed bg-bg-warm",
          className,
        )}
      />
    );
  }
  return (
    <div
      data-testid="paper-skeleton-block"
      style={style}
      className={cn(
        "border-burgundy/40 rounded-[2px] border-2 border-dashed bg-bg-warm bg-paper-noise",
        className,
      )}
    />
  );
}

function CenteredStamp() {
  return (
    <div
      role="status"
      aria-label={uk.loading.label}
      className="ps-stamp-pulse pointer-events-none flex items-center justify-center"
    >
      <Stamp text={uk.loading.stamp} rotation={-3} animateOn="load" />
    </div>
  );
}

export function PaperSkeletonPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-20">
      <CenteredStamp />
    </div>
  );
}

export function PaperSkeletonGrid({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) {
  const tiles = Array.from({ length: cols * rows });
  return (
    <div className="relative">
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {tiles.map((_, i) => (
          <PaperSkeleton key={i} variant="block" ratio="4/5" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenteredStamp />
      </div>
    </div>
  );
}

export function PaperSkeletonForm({ fields = 5 }: { fields?: number }) {
  return (
    <div className="relative mx-auto max-w-lg space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <PaperSkeleton variant="line" width={120} height={10} />
          <PaperSkeleton variant="block" height={44} />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenteredStamp />
      </div>
    </div>
  );
}

export function PaperSkeletonProfile() {
  return (
    <div className="relative space-y-6">
      <PaperSkeleton variant="block" height={120} />
      <div className="grid gap-4 md:grid-cols-3">
        <PaperSkeleton variant="block" height={140} />
        <PaperSkeleton variant="block" height={140} />
        <PaperSkeleton variant="block" height={140} />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenteredStamp />
      </div>
    </div>
  );
}

export function PaperSkeletonArticle() {
  return (
    <div className="relative mx-auto max-w-2xl space-y-5">
      <PaperSkeleton variant="block" ratio="16/9" />
      <PaperSkeleton variant="line" width="80%" />
      <PaperSkeleton variant="line" width="95%" />
      <PaperSkeleton variant="line" width="70%" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenteredStamp />
      </div>
    </div>
  );
}
