"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  removeImage,
  reorderImages,
} from "@/shared/api/generated/student-products/student-products";
import type { ImageReorderRequest } from "@/shared/api/generated/models/imageReorderRequest";
import { studentKeys } from "@/shared/api/student-keys";

/** Deletes one product image. */
export function useRemoveProductImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) =>
      removeImage(productId, imageId, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.product(productId) }),
  });
}

/** Reorders product images and sets the primary one. */
export function useReorderProductImages(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ImageReorderRequest) =>
      reorderImages(productId, body, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: studentKeys.product(productId) }),
  });
}
