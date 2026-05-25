"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approve } from "@/shared/api/generated/admin-products/admin-products";
import { adminKeys } from "@/shared/api/admin-keys";
import { revalidateOnClient } from "@/shared/api";

/** Approves a PENDING_REVIEW product → ACTIVE. */
export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      approve(id, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
    onSuccess: async (_d, id) => {
      await revalidateOnClient(["catalog", `product:${id}`]);
      qc.invalidateQueries({ queryKey: adminKeys.products() });
    },
  });
}
