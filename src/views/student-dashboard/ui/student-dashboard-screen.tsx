"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/shared/api/generated/user-account/user-account";
import { list } from "@/shared/api/generated/student-products/student-products";
import { summary } from "@/shared/api/generated/student-finance/student-finance";
import { studentKeys } from "@/shared/api/student-keys";
import { fmtUAH } from "@/shared/lib/money";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, PillButton } from "@/shared/ui";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";
import { StudentProductCard } from "@/entities/product";

const RECENT_PARAMS = { pageable: { page: 0, size: 3, sort: ["createdAt,desc"] } };

export function StudentDashboardScreen() {
  const me = useQuery({ queryKey: studentKeys.me(), queryFn: () => getMe() });
  const products = useQuery({
    queryKey: studentKeys.products(RECENT_PARAMS),
    queryFn: () => list(RECENT_PARAMS),
  });
  const finance = useQuery({ queryKey: studentKeys.finance(), queryFn: () => summary() });

  const firstName = me.data?.firstName ?? "";
  const total = products.data?.totalElements ?? 0;
  const recent = products.data?.content ?? [];
  const netEarned = finance.data?.totalNetEarned;

  return (
    <EditorialPageShell>
      <EditorialLabel>КАБІНЕТ УЧНЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">
        {firstName ? `Привіт, ${firstName}!` : "Привіт!"} Що сьогодні створюєш?
      </h1>

      {products.isLoading || finance.isLoading ? (
        <PaperSkeletonProfile />
      ) : (
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="border border-line bg-bg-card p-4">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              Усього робіт
            </dt>
            <dd className="font-display text-h2 italic text-ink">{total}</dd>
          </div>
          <div className="border border-line bg-bg-card p-4">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              Зароблено (net)
            </dt>
            <dd className="font-display text-h2 italic text-green">
              {netEarned ? fmtUAH(netEarned) : "—"}
            </dd>
          </div>
          <div className="border border-line bg-bg-card p-4">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">У холді</dt>
            <dd className="font-display text-h2 italic text-ink">
              {finance.data?.pendingHold ? fmtUAH(finance.data.pendingHold) : "—"}
            </dd>
          </div>
        </dl>
      )}

      <EditorialDivider />
      <nav aria-label="Швидкі дії" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PillButton asChild>
          <Link href="/student/products">Мої роботи</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/student/products/new">Додати роботу</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/student/finance">Фінанси</Link>
        </PillButton>
      </nav>
      <EditorialDivider />

      {recent.length > 0 ? (
        <section className="flex flex-col gap-3">
          <EditorialLabel>ОСТАННІ РОБОТИ</EditorialLabel>
          {recent.map((p) => (
            <StudentProductCard key={p.id} product={p} actions={null} />
          ))}
        </section>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8">
          <ImageSlot
            slot="student/empty/no-products"
            src="/images/student/empty/no-products.webp"
            ratio="1/1"
            variant="stamp"
            caption="Поки робіт немає"
            className="w-32"
          />
          <p className="font-display text-h3 italic text-ink-soft">
            Додай свою першу роботу — і вона з&apos;явиться в архіві.
          </p>
        </div>
      )}
    </EditorialPageShell>
  );
}
