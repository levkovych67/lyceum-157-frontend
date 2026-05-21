import Image from "next/image";
import type { ReactNode } from "react";
import type { StudentProductDto } from "@/shared/api/generated/models/studentProductDto";
import { fmtUAH } from "@/shared/lib/money";
import { ProductStatusBadge } from "@/entities/product/ui/product-status-badge";

export function StudentProductCard({
  product,
  actions,
}: {
  product: StudentProductDto;
  actions: ReactNode;
}) {
  return (
    <article className="flex gap-4 border border-line bg-bg-card p-4">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-line bg-bg">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.title ?? ""}
            fill
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-mono text-[10px] text-ink-soft">
            БЕЗ ФОТО
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-h3 italic text-ink">{product.title}</h3>
          {product.status ? <ProductStatusBadge status={product.status} /> : null}
        </div>
        <p className="font-mono text-sm text-ink">
          {product.priceUah ? fmtUAH(product.priceUah) : "—"}
        </p>
        {product.status === "REJECTED" && product.rejectionReason ? (
          <p className="text-sm text-burgundy">Причина: {product.rejectionReason}</p>
        ) : null}
        <p className="font-mono text-[11px] text-ink-soft">
          {product.type} · фото: {product.imageCount ?? 0} · продано: {product.totalSold ?? 0}
        </p>
        {actions ? <div className="mt-2 flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </article>
  );
}
