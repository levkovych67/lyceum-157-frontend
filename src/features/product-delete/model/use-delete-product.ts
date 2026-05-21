"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { _delete as deleteProduct } from "@/shared/api/generated/student-products/student-products";
import { studentKeys } from "@/shared/api/student-keys";

/** Soft-deletes a student product. */
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteProduct(id, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.products() });
    },
  });
}
