"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError, revalidateOnClient } from "@/shared/api";

export function useRejectProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.products.reject(id, reason),
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
