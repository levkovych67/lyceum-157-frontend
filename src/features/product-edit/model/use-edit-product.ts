"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { edit } from "@/shared/api/generated/student-products/student-products";
import type { EditProductRequest } from "@/shared/api/generated/models/editProductRequest";
import { studentKeys } from "@/shared/api/student-keys";

/** Edits a DRAFT or REJECTED product. */
export function useEditProduct(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EditProductRequest) =>
      edit(productId, body, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.product(productId) });
      qc.invalidateQueries({ queryKey: studentKeys.products() });
    },
  });
}
