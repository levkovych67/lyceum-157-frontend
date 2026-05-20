import { cn } from "@/shared/lib";
import { fmtUAH } from "@/shared/lib/money";

export type MuseumLabelProps = {
  title: string;
  author: string;
  meta?: string;
  priceUah: string;
  className?: string;
};
export function MuseumLabel({ title, author, meta, priceUah, className }: MuseumLabelProps) {
  return (
    <div className={cn("w-full max-w-[240px] border-y border-ink-fade py-3 text-ink", className)}>
      <p className="font-display text-lead italic">{title}</p>
      <p className="text-small font-medium">{author}</p>
      {meta && <p className="text-small italic text-ink-soft">{meta}</p>}
      <hr className="my-2 w-1/3 border-t border-ink-fade" />
      <p className="text-h3 font-bold text-burgundy">{fmtUAH(priceUah)}</p>
    </div>
  );
}
