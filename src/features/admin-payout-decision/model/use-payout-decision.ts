"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approve1, reject1 } from "@/shared/api/generated/admin-payouts/admin-payouts";
import { adminKeys } from "@/shared/api/admin-keys";

/** Approves a HOLD payout → APPROVED. 2FA-gated via X-TOTP-Code header. */
export function useApprovePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      approve1(id, { headers: { "Idempotency-Key": crypto.randomUUID(), "X-TOTP-Code": code } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.payouts() }),
  });
}

/** Rejects a HOLD payout → CANCELLED. 2FA-gated; reason mandatory. */
export function useRejectPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, code }: { id: string; reason: string; code: string }) =>
      reject1(
        id,
        { reason },
        { headers: { "Idempotency-Key": crypto.randomUUID(), "X-TOTP-Code": code } },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.payouts() }),
  });
}
