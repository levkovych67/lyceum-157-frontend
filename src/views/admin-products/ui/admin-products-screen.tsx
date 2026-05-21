"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { list3 } from "@/shared/api/generated/admin-products/admin-products";
import { adminKeys } from "@/shared/api/admin-keys";
import type { AdminProductDto } from "@/shared/api/generated/models/adminProductDto";
import type { AdminProductDtoStatus } from "@/shared/api/generated/models/adminProductDtoStatus";
import { fmtUAH } from "@/shared/lib/money";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, PillButton, toast } from "@/shared/ui";
import { PaperSkeletonGrid } from "@/shared/ui/paper-skeleton";
import { ProductStatusBadge } from "@/entities/product";
import { RejectForm } from "@/features/admin-product-reject";
import { useApproveProduct } from "@/features/admin-product-approve";

const FILTERS: { value: AdminProductDtoStatus; label: string }[] = [
  { value: "PENDING_REVIEW", label: "На розгляді" },
  { value: "ACTIVE", label: "Активні" },
  { value: "REJECTED", label: "Відхилені" },
  { value: "HIDDEN", label: "Приховані" },
];
const PAGE_SIZE = 20;

export function AdminProductsScreen() {
  const [status, setStatus] = useState<AdminProductDtoStatus>("PENDING_REVIEW");
  const [page, setPage] = useState(0);
  const params = { status, pageable: { page, size: PAGE_SIZE, sort: ["createdAt,desc"] } };
  const q = useQuery({
    queryKey: adminKeys.products(params),
    queryFn: () => list3(params),
  });
  const items = q.data?.content ?? [];
  const totalPages = q.data?.totalPages ?? 0;

  return (
    <EditorialPageShell>
      <EditorialLabel>МОДЕРАЦІЯ РОБІТ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Роботи на перевірку</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setStatus(f.value);
              setPage(0);
            }}
            data-active={status === f.value}
            className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wide data-[active=true]:border-burgundy data-[active=true]:text-burgundy"
          >
            {f.label}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <PaperSkeletonGrid />
      ) : items.length === 0 ? (
        <p className="py-12 text-center font-display text-h3 italic text-ink-soft">
          За цим фільтром робіт немає.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((p) => (
            <ModerationCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4">
          <PillButton variant="ghost" disabled={page === 0} onClick={() => setPage((x) => x - 1)}>
            ← Назад
          </PillButton>
          <span className="font-mono text-sm text-ink-soft">
            {page + 1} / {totalPages}
          </span>
          <PillButton
            variant="ghost"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((x) => x + 1)}
          >
            Далі →
          </PillButton>
        </div>
      ) : null}
    </EditorialPageShell>
  );
}

function ModerationCard({ product }: { product: AdminProductDto }) {
  const [rejecting, setRejecting] = useState(false);
  const approve = useApproveProduct();
  const id = product.id ?? "";

  return (
    <article className="flex flex-col gap-2 border border-line bg-bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-h3 italic text-ink">{product.title}</h3>
        {product.status ? <ProductStatusBadge status={product.status} /> : null}
      </div>
      <p className="font-mono text-sm text-ink">
        {product.priceUah ? fmtUAH(product.priceUah) : "—"} · {product.type}
      </p>
      <p className="font-mono text-[11px] text-ink-soft">
        Учень: {product.studentFullName} ({product.studentGrade}) · KYC:{" "}
        {product.kycSigned ? "підписано ✓" : "НЕ підписано ✗"}
      </p>
      {product.descriptionPlain ? (
        <p className="line-clamp-3 text-body text-ink-soft">{product.descriptionPlain}</p>
      ) : null}

      {product.status === "PENDING_REVIEW" ? (
        rejecting ? (
          <RejectForm
            productId={id}
            onDone={() => setRejecting(false)}
            onCancel={() => setRejecting(false)}
          />
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <PillButton
              loading={approve.isPending}
              onClick={() =>
                approve.mutate(id, { onSuccess: () => toast.success("Роботу схвалено") })
              }
            >
              Схвалити
            </PillButton>
            <PillButton variant="ghost" onClick={() => setRejecting(true)}>
              Відхилити
            </PillButton>
          </div>
        )
      ) : null}
    </article>
  );
}
