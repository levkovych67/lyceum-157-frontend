"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reject as rejectProduct } from "@/shared/api/generated/admin-products/admin-products";
import { ApiError, revalidateOnClient } from "@/shared/api";

export function useRejectProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectProduct(id, { reason }, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
    onSuccess: async (_d, vars) => {
      await revalidateOnClient(["catalog", `product:${vars.id}`]);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: async (err, vars) => {
      if (err instanceof ApiError && err.problem.type === "urn:l157:product/wrong-state") {
        await revalidateOnClient(["catalog", `product:${vars.id}`]);
        qc.invalidateQueries({ queryKey: ["admin", "products"] });
      }
    },
  });
}
