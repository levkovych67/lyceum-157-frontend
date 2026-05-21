"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { detail1 } from "@/shared/api/generated/admin-orders/admin-orders";
import { adminKeys } from "@/shared/api/admin-keys";
import { fmtUAH } from "@/shared/lib/money";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, PillButton } from "@/shared/ui";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
import { RefundForm } from "@/features/admin-order-refund";

export function AdminOrderScreen({ id }: { id: string }) {
  const qc = useQueryClient();
  const [refunding, setRefunding] = useState(false);
  const q = useQuery({ queryKey: adminKeys.order(id), queryFn: () => detail1(id) });
  const order = q.data;
  const canRefund =
    !!order &&
    !order.refund &&
    !!order.refundableUntil &&
    new Date(order.refundableUntil).getTime() > Date.now();

  return (
    <EditorialPageShell>
      <EditorialLabel>ДЕТАЛЬ ЗАМОВЛЕННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">
        {order?.orderNumber ?? "Замовлення"}
      </h1>

      {q.isLoading ? (
        <PaperSkeletonForm />
      ) : q.isError || !order ? (
        <p className="text-body text-burgundy">Не вдалось завантажити замовлення.</p>
      ) : (
        <>
          <section className="border border-line bg-bg-card p-4">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Покупець</p>
            <p className="text-body text-ink">
              {order.buyerName} · {order.buyerEmail} · {order.buyerPhone}
            </p>
            <p className="font-mono text-sm text-ink-soft">
              Статус: {order.status} · сума: {order.totalAmount ? fmtUAH(order.totalAmount) : "—"}
            </p>
          </section>

          <EditorialLabel>ПОЗИЦІЇ</EditorialLabel>
          <ul className="flex flex-col gap-2">
            {(order.items ?? []).map((it, idx) => (
              <li
                key={`${it.productId}-${idx}`}
                className="flex flex-wrap justify-between gap-2 border border-line bg-bg-card p-3 font-mono text-sm"
              >
                <span className="text-ink">
                  {it.productTitle} — {it.studentFullName}
                </span>
                <span className="text-ink-soft">
                  {it.quantity} × {it.pricePerUnit ? fmtUAH(it.pricePerUnit) : "—"} ={" "}
                  {it.lineGross ? fmtUAH(it.lineGross) : "—"} · виплата: {it.payoutStatus}
                </span>
              </li>
            ))}
          </ul>

          {order.payment ? (
            <p className="font-mono text-[11px] text-ink-soft">
              Платіж: {order.payment.paymentMethod} · LiqPay {order.payment.liqpayOrderId} ·{" "}
              {order.payment.paidAt}
            </p>
          ) : null}

          {order.refund ? (
            <div className="border border-burgundy bg-bg-card p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-burgundy">
                Кошти повернено
              </p>
              <p className="text-body text-ink">
                {order.refund.refundedAt} · {order.refund.reason}
              </p>
            </div>
          ) : null}

          {canRefund ? (
            <>
              <EditorialDivider />
              {refunding ? (
                <RefundForm
                  orderId={id}
                  onDone={() => {
                    setRefunding(false);
                    qc.invalidateQueries({ queryKey: adminKeys.order(id) });
                  }}
                  onCancel={() => setRefunding(false)}
                />
              ) : (
                <PillButton variant="ghost" onClick={() => setRefunding(true)}>
                  Повернення коштів
                </PillButton>
              )}
            </>
          ) : null}
        </>
      )}
    </EditorialPageShell>
  );
}
