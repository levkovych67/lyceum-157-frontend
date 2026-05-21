"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { list5 } from "@/shared/api/generated/admin-orders/admin-orders";
import { adminKeys } from "@/shared/api/admin-keys";
import { fmtUAH } from "@/shared/lib/money";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, Input, PillButton } from "@/shared/ui";
import { PaperSkeletonGrid } from "@/shared/ui/paper-skeleton";

const PAGE_SIZE = 20;

export function AdminOrdersScreen() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const params = {
    ...(query.trim() ? { q: query.trim() } : {}),
    pageable: { page, size: PAGE_SIZE, sort: ["paidAt,desc"] },
  };
  const q = useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => list5(params),
  });
  const items = q.data?.content ?? [];
  const totalPages = q.data?.totalPages ?? 0;

  return (
    <EditorialPageShell>
      <EditorialLabel>ЗАМОВЛЕННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Реєстр замовлень</h1>

      <form
        className="flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
        }}
      >
        <Input
          placeholder="Пошук за №, email, ПІБ"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <PillButton type="submit" variant="outline-d">
          Знайти
        </PillButton>
      </form>

      {q.isLoading ? (
        <PaperSkeletonGrid />
      ) : items.length === 0 ? (
        <p className="py-12 text-center font-display text-h3 italic text-ink-soft">
          Замовлень не знайдено.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((o) => (
            <li key={o.orderId}>
              <Link
                href={`/admin/orders/${o.orderId}`}
                className="flex flex-wrap items-baseline justify-between gap-2 border border-line bg-bg-card p-3 hover:border-burgundy"
              >
                <span className="font-display text-h3 italic text-ink">{o.orderNumber}</span>
                <span className="font-mono text-[11px] uppercase text-ink-soft">
                  {o.status} · {o.buyerName} · позицій: {o.itemsCount}
                </span>
                <span className="font-mono text-sm text-ink">
                  {o.totalAmount ? fmtUAH(o.totalAmount) : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
