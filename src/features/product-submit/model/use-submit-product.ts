"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submit, resubmit } from "@/shared/api/generated/student-products/student-products";
import { studentKeys } from "@/shared/api/student-keys";

/** Submits a DRAFT (submit) or a REJECTED (resubmit) product for admin review. */
export function useSubmitProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: "submit" | "resubmit" }) => {
      const opts = { headers: { "Idempotency-Key": crypto.randomUUID() } };
      return mode === "submit" ? submit(id, opts) : resubmit(id, opts);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: studentKeys.products() });
      qc.invalidateQueries({ queryKey: studentKeys.product(vars.id) });
    },
  });
}
