"use client";
import { useMutation } from "@tanstack/react-query";
import { create as createProduct } from "@/shared/api/generated/student-products/student-products";
import type { CreateProductRequest } from "@/shared/api";

export function useCreateProduct() {
  return useMutation({
    mutationFn: (b: CreateProductRequest) =>
      createProduct(b, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
  });
}
