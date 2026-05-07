"use client";
import { useMutation } from "@tanstack/react-query";
import { studentApi, uploadToS3 } from "@/shared/api";

export type UploadInput = { productId: string; file: File; primary: boolean; signal?: AbortSignal };

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async ({ productId, file, primary, signal }: UploadInput) => {
      const presigned = await studentApi.products.uploadUrl(
        productId,
        file.type as "image/jpeg" | "image/png" | "image/webp",
      );
      await uploadToS3(presigned, file, signal);
      await studentApi.products.confirmImg(productId, {
        s3Key: presigned.s3Key,
        declaredMimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
        primary,
      });
      return { s3Key: presigned.s3Key };
    },
  });
}
