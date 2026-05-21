"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hide, unhide } from "@/shared/api/generated/student-products/student-products";
import { studentKeys } from "@/shared/api/student-keys";

/** Hides an ACTIVE product or restores a HIDDEN one. */
export function useProductVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "hide" | "unhide" }) => {
      const opts = { headers: { "Idempotency-Key": crypto.randomUUID() } };
      return action === "hide" ? hide(id, opts) : unhide(id, opts);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: studentKeys.products() });
      qc.invalidateQueries({ queryKey: studentKeys.product(vars.id) });
    },
  });
}
