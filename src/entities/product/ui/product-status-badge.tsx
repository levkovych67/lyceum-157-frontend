import type { StudentProductDtoStatus } from "@/shared/api/generated/models/studentProductDtoStatus";
import { productStatusLabel, productStatusTone } from "@/entities/product/model/product-status";

const TONE_CLASS: Record<string, string> = {
  green: "border-green text-green",
  burgundy: "border-burgundy text-burgundy",
  muted: "border-line text-ink-soft",
};

export function ProductStatusBadge({ status }: { status: StudentProductDtoStatus }) {
  const tone = productStatusTone(status);
  return (
    <span
      data-tone={tone}
      className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] ${TONE_CLASS[tone]}`}
    >
      {productStatusLabel(status)}
    </span>
  );
}
