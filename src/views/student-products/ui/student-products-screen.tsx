"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { list } from "@/shared/api/generated/student-products/student-products";
import { studentKeys } from "@/shared/api/student-keys";
import type { StudentProductDtoStatus } from "@/shared/api/generated/models/studentProductDtoStatus";
import type { StudentProductDto } from "@/shared/api/generated/models/studentProductDto";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot, PillButton } from "@/shared/ui";
import { PaperSkeletonGrid } from "@/shared/ui/paper-skeleton";
import { StudentProductCard } from "@/entities/product";
import { useSubmitProduct } from "@/features/product-submit";
import { useProductVisibility } from "@/features/product-visibility";
import { DeleteProductButton } from "@/features/product-delete";

const FILTERS: { value: StudentProductDtoStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Усі" },
  { value: "DRAFT", label: "Чернетки" },
  { value: "PENDING_REVIEW", label: "На розгляді" },
  { value: "ACTIVE", label: "Активні" },
  { value: "REJECTED", label: "Відхилені" },
  { value: "HIDDEN", label: "Приховані" },
];
const PAGE_SIZE = 20;

export function StudentProductsScreen() {
  const [filter, setFilter] = useState<StudentProductDtoStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const params = {
    pageable: { page, size: PAGE_SIZE, sort: ["createdAt,desc"] },
    ...(filter === "ALL" ? {} : { status: [filter] }),
  };
  const q = useQuery({
    queryKey: studentKeys.products(params),
    queryFn: () => list(params),
  });
  const items = q.data?.content ?? [];
  const totalPages = q.data?.totalPages ?? 0;

  return (
    <EditorialPageShell>
      <EditorialLabel>МОЇ РОБОТИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Каталог моїх робіт</h1>
      <PillButton asChild>
        <Link href="/student/products/new">+ Нова робота</Link>
      </PillButton>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setFilter(f.value);
              setPage(0);
            }}
            data-active={filter === f.value}
            className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wide data-[active=true]:border-burgundy data-[active=true]:text-burgundy"
          >
            {f.label}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <PaperSkeletonGrid />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <ImageSlot
            slot="student/empty/no-products"
            src="/images/student/empty/no-products.webp"
            ratio="1/1"
            variant="stamp"
            caption="Поки робіт немає"
            className="w-32"
          />
          <p className="font-display text-h3 italic text-ink-soft">
            {filter === "ALL"
              ? "Список робіт зʼявиться тут після того як додаси першу."
              : "За цим фільтром робіт немає."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((p) => (
            <StudentProductCard key={p.id} product={p} actions={<ProductActions product={p} />} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4">
          <PillButton variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Назад
          </PillButton>
          <span className="font-mono text-sm text-ink-soft">
            {page + 1} / {totalPages}
          </span>
          <PillButton
            variant="ghost"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Далі →
          </PillButton>
        </div>
      ) : null}
    </EditorialPageShell>
  );
}

function ProductActions({ product }: { product: StudentProductDto }) {
  const submitMutation = useSubmitProduct();
  const visibility = useProductVisibility();
  const id = product.id ?? "";
  const editLink = (
    <PillButton asChild variant="outline-d">
      <Link href={`/student/products/${id}/edit`}>Редагувати</Link>
    </PillButton>
  );

  switch (product.status) {
    case "DRAFT":
      return (
        <>
          {editLink}
          <PillButton
            loading={submitMutation.isPending}
            onClick={() => submitMutation.mutate({ id, mode: "submit" })}
          >
            Подати
          </PillButton>
          <DeleteProductButton productId={id} title={product.title ?? ""} />
        </>
      );
    case "REJECTED":
      return (
        <>
          {editLink}
          <PillButton
            loading={submitMutation.isPending}
            onClick={() => submitMutation.mutate({ id, mode: "resubmit" })}
          >
            Подати знову
          </PillButton>
          <DeleteProductButton productId={id} title={product.title ?? ""} />
        </>
      );
    case "ACTIVE":
      return (
        <PillButton
          variant="ghost"
          loading={visibility.isPending}
          onClick={() => visibility.mutate({ id, action: "hide" })}
        >
          Приховати
        </PillButton>
      );
    case "HIDDEN":
      return (
        <PillButton
          variant="ghost"
          loading={visibility.isPending}
          onClick={() => visibility.mutate({ id, action: "unhide" })}
        >
          Показати
        </PillButton>
      );
    default:
      return null;
  }
}
