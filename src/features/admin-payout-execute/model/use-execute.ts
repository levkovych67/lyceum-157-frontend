"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/shared/api";
export function useExecutePayouts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payoutIds, code }: { payoutIds: string[]; code: string }) =>
      adminApi.payouts.execute(payoutIds, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payouts"] }),
  });
}
