"use client";
import { useMutation } from "@tanstack/react-query";
import { studentApi, type CreateProductRequest } from "@/shared/api";
export function useCreateProduct() {
  return useMutation({ mutationFn: (b: CreateProductRequest) => studentApi.products.create(b) });
}
