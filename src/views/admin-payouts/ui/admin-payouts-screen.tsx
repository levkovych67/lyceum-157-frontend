"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { list4 } from "@/shared/api/generated/admin-payouts/admin-payouts";
import { adminKeys } from "@/shared/api/admin-keys";
import type { AdminPayoutDto } from "@/shared/api/generated/models/adminPayoutDto";
import { fmtUAH } from "@/shared/lib/money";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, PillButton } from "@/shared/ui";
import { PaperSkeletonGrid } from "@/shared/ui/paper-skeleton";
import { PayoutDecision } from "@/features/admin-payout-decision";
import { PayoutExecuteForm } from "@/features/admin-payout-execute";

const STATUS_TABS = ["HOLD", "APPROVED", "PROCESSING", "PAID_OUT", "FAILED", "CANCELLED"] as const;
const PAGE_SIZE = 20;

export function AdminPayoutsScreen() {
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]>("APPROVED");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const params = { status: [status], pageable: { page, size: PAGE_SIZE } };
  const q = useQuery({
    queryKey: adminKeys.payouts(params),
    queryFn: () => list4(params),
  });
  const items: AdminPayoutDto[] = q.data?.content ?? [];
  const totalPages = q.data?.totalPages ?? 0;

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <EditorialPageShell>
      <EditorialLabel>РЕЄСТР ВИПЛАТ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Виплати учням</h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(0);
              setSelected([]);
            }}
            data-active={status === s}
            className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wide data-[active=true]:border-burgundy data-[active=true]:text-burgundy"
          >
            {s}
          </button>
        ))}
      </div>

      {status === "APPROVED" && selected.length > 0 ? (
        <div className="border border-burgundy bg-bg-card p-3">
          <PayoutExecuteForm payoutIds={selected} />
        </div>
      ) : null}

      {q.isLoading ? (
        <PaperSkeletonGrid />
      ) : items.length === 0 ? (
        <p className="py-12 text-center font-display text-h3 italic text-ink-soft">
          Виплат за цим статусом немає.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((p) => (
            <li
              key={p.payoutId}
              className="flex flex-wrap items-center gap-3 border border-line bg-bg-card p-3"
            >
              {status === "APPROVED" ? (
                <input
                  type="checkbox"
                  aria-label={`Обрати виплату ${p.studentFullName}`}
                  checked={selected.includes(p.payoutId ?? "")}
                  onChange={() => toggle(p.payoutId ?? "")}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-display text-h3 italic text-ink">{p.studentFullName}</p>
                <p className="font-mono text-[11px] text-ink-soft">
                  {p.studentGrade} · батько: {p.parentName} · картка {p.cardMasked} · {p.status}
                  {p.failureReason ? ` · ${p.failureReason}` : ""}
                </p>
              </div>
              <span className="font-mono text-sm text-ink">
                {p.netAmount ? fmtUAH(p.netAmount) : "—"}
              </span>
              {p.status === "HOLD" ? <PayoutDecision payoutId={p.payoutId ?? ""} /> : null}
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
