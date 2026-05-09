"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/shared/api";

export function useExecutePayouts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payoutIds, code }: { payoutIds: string[]; code: string }) =>
      adminApi.payouts.execute(payoutIds, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payouts"] }),
    onError: (err) => {
      if (err instanceof ApiError && err.problem.type === "urn:l157:payout/wrong-state") {
        qc.invalidateQueries({ queryKey: ["admin", "payouts"] });
      }
    },
  });
}
