"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { list3 } from "@/shared/api/generated/admin-products/admin-products";
import { list4 } from "@/shared/api/generated/admin-payouts/admin-payouts";
import { list5 } from "@/shared/api/generated/admin-orders/admin-orders";
import { getMe } from "@/shared/api/generated/user-account/user-account";
import { adminKeys } from "@/shared/api/admin-keys";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, PillButton } from "@/shared/ui";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";

const PENDING_PRODUCTS = { status: "PENDING_REVIEW" as const, pageable: { page: 0, size: 1 } };
const APPROVED_PAYOUTS = { status: ["APPROVED" as const], pageable: { page: 0, size: 1 } };
const PAID_ORDERS = { status: ["PAID" as const], pageable: { page: 0, size: 1 } };

export function AdminDashboardScreen() {
  const products = useQuery({
    queryKey: adminKeys.products(PENDING_PRODUCTS),
    queryFn: () => list3(PENDING_PRODUCTS),
  });
  const payouts = useQuery({
    queryKey: adminKeys.payouts(APPROVED_PAYOUTS),
    queryFn: () => list4(APPROVED_PAYOUTS),
  });
  const orders = useQuery({
    queryKey: adminKeys.orders(PAID_ORDERS),
    queryFn: () => list5(PAID_ORDERS),
  });
  const me = useQuery({ queryKey: adminKeys.me(), queryFn: () => getMe() });

  const loading = products.isLoading || payouts.isLoading || orders.isLoading;

  return (
    <EditorialPageShell>
      <EditorialLabel>КАБІНЕТ АДМІНІСТРАТОРА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Контроль майстерні</h1>

      {loading ? (
        <PaperSkeletonProfile />
      ) : (
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="border border-line bg-bg-card p-4">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              Робіт на модерації
            </dt>
            <dd className="font-display text-h2 italic text-burgundy">
              {products.data?.totalElements ?? 0}
            </dd>
          </div>
          <div className="border border-line bg-bg-card p-4">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              Виплат на схвалення
            </dt>
            <dd className="font-display text-h2 italic text-ink">
              {payouts.data?.totalElements ?? 0}
            </dd>
          </div>
          <div className="border border-line bg-bg-card p-4">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              Оплачених замовлень
            </dt>
            <dd className="font-display text-h2 italic text-ink">
              {orders.data?.totalElements ?? 0}
            </dd>
          </div>
        </dl>
      )}

      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
        2FA: {me.data?.twoFaEnrolled ? "підключено ✓" : "не підключено — налаштуй на /admin/2fa"}
      </p>

      <EditorialDivider />
      <nav aria-label="Розділи адмінки" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PillButton asChild>
          <Link href="/admin/products">Модерація робіт</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/admin/orders">Замовлення</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/admin/payouts">Виплати</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/admin/2fa">2FA</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/admin/reports/tax">Податковий звіт</Link>
        </PillButton>
      </nav>
    </EditorialPageShell>
  );
}
