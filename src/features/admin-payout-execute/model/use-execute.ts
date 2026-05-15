"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute as executePayouts } from "@/shared/api/generated/admin-payouts/admin-payouts";
import { ApiError } from "@/shared/api";

export function useExecutePayouts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payoutIds, code }: { payoutIds: string[]; code: string }) =>
      executePayouts(
        { payoutIds },
        { headers: { "Idempotency-Key": crypto.randomUUID(), "X-TOTP-Code": code } },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payouts"] }),
    onError: (err) => {
      if (err instanceof ApiError && err.problem.type === "urn:l157:payout/wrong-state") {
        qc.invalidateQueries({ queryKey: ["admin", "payouts"] });
      }
    },
  });
}
