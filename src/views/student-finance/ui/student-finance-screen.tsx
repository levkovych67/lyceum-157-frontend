"use client";
import { useQuery } from "@tanstack/react-query";
import { summary } from "@/shared/api/generated/student-finance/student-finance";
import { list1 } from "@/shared/api/generated/student-orders/student-orders";
import { studentKeys } from "@/shared/api/student-keys";
import { fmtUAH } from "@/shared/lib/money";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot } from "@/shared/ui";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";
import { PayoutLine } from "@/views/student-finance/ui/payout-line";

const ORDERS_PARAMS = { pageable: { page: 0, size: 10, sort: ["paidAt,desc"] } };

export function StudentFinanceScreen() {
  const fin = useQuery({ queryKey: studentKeys.finance(), queryFn: () => summary() });
  const orders = useQuery({
    queryKey: studentKeys.orders(ORDERS_PARAMS),
    queryFn: () => list1(ORDERS_PARAMS),
  });
  const f = fin.data;
  const sales = orders.data?.content ?? [];

  return (
    <EditorialPageShell>
      <EditorialLabel>РОЗРАХУНОК</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Фінанси</h1>
      <ImageSlot
        slot="student/finance/banner"
        src="/images/student/finance/banner.webp"
        ratio="16/9"
        variant="interlude"
        caption="Hero банер фінансів"
      />
      <EditorialDivider />

      {fin.isLoading ? (
        <PaperSkeletonProfile />
      ) : !f || !f.totalGross || f.totalGross === "0.00" ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <ImageSlot
            slot="student/empty/no-payouts"
            src="/images/student/empty/no-payouts.webp"
            ratio="1/1"
            variant="stamp"
            caption="Виплат поки немає"
            className="w-32"
          />
          <p className="font-display text-h3 italic text-ink-soft">
            Підсумок зʼявиться після першого продажу.
          </p>
        </div>
      ) : (
        <section className="flex flex-col">
          <EditorialLabel>РОЗРАХУНКОВИЙ ЛИСТ</EditorialLabel>
          <PayoutLine label="Валовий продаж" amount={f.totalGross} />
          {f.taxBreakdown?.pdfo ? (
            <PayoutLine label="ПДФО 18%" amount={f.taxBreakdown.pdfo} negative />
          ) : null}
          {f.taxBreakdown?.vz ? (
            <PayoutLine label="Військовий збір 1.5%" amount={f.taxBreakdown.vz} negative />
          ) : null}
          {f.feeBreakdown?.liqpay ? (
            <PayoutLine label="Комісія LiqPay" amount={f.feeBreakdown.liqpay} negative />
          ) : null}
          <PayoutLine label="Чистий заробіток" amount={f.totalNetEarned ?? "0.00"} strong />

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <FinanceStat label="У холді" value={f.pendingHold} />
            <FinanceStat label="Схвалено" value={f.pendingApproved} />
            <FinanceStat label="Виплачено" value={f.paidOut} />
            <FinanceStat label="Повернено" value={f.refunded} />
          </div>

          {f.recentMonths && f.recentMonths.length > 0 ? (
            <div className="mt-6">
              <EditorialLabel>ОСТАННІ 6 МІСЯЦІВ</EditorialLabel>
              <ul className="mt-2 flex flex-col">
                {f.recentMonths.map((mth) => (
                  <li
                    key={mth.month}
                    className="flex justify-between border-b border-line py-1.5 font-mono text-sm"
                  >
                    <span className="text-ink-soft">{mth.month}</span>
                    <span className="text-ink">
                      gross {mth.gross ? fmtUAH(mth.gross) : "—"} · net{" "}
                      {mth.net ? fmtUAH(mth.net) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      <EditorialDivider />
      <EditorialLabel>ОСТАННІ ПРОДАЖІ</EditorialLabel>
      {orders.isLoading ? (
        <PaperSkeletonProfile />
      ) : sales.length === 0 ? (
        <p className="text-body text-ink-soft">Продажів поки немає.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sales.map((s) => (
            <li
              key={s.orderItemId}
              className="flex flex-wrap items-baseline justify-between gap-2 border border-line bg-bg-card p-3"
            >
              <span className="font-display text-h3 italic text-ink">{s.productTitle}</span>
              <span className="font-mono text-[11px] uppercase text-ink-soft">
                {s.orderNumber} · {s.status} · виплата: {s.payoutStatus}
              </span>
              <span className="font-mono text-sm text-ink">
                {s.grossAmount ? fmtUAH(s.grossAmount) : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </EditorialPageShell>
  );
}

function FinanceStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border border-line bg-bg-card p-3">
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="font-mono text-sm text-ink">{value ? fmtUAH(value) : "—"}</p>
    </div>
  );
}
