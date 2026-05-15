"use client";
import { useMutation } from "@tanstack/react-query";
import {
  requestImageUploadUrl,
  confirmImage,
} from "@/shared/api/generated/student-products/student-products";
import { uploadToS3 } from "@/shared/api";
import type { PresignedUploadDto as PresignedUploadStrict } from "@/shared/api/upload-s3";

export type UploadInput = { productId: string; file: File; primary: boolean; signal?: AbortSignal };

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async ({ productId, file, primary, signal }: UploadInput) => {
      const ct = file.type as "image/jpeg" | "image/png" | "image/webp";
      const presigned = await requestImageUploadUrl(
        productId,
        { contentType: ct },
        { headers: { "Idempotency-Key": crypto.randomUUID() } },
      );
      // Generated DTO marks all fields optional; coerce to strict shape uploadToS3 expects.
      const strict: PresignedUploadStrict = {
        url: presigned.url ?? "",
        s3Key: presigned.s3Key ?? "",
        requiredHeaders: (presigned.requiredHeaders ?? {}) as Record<string, string>,
        expiresAt: presigned.expiresAt ?? "",
      };
      await uploadToS3(strict, file, signal);
      await confirmImage(
        productId,
        { s3Key: strict.s3Key, declaredMimeType: ct, primary },
        { headers: { "Idempotency-Key": crypto.randomUUID() } },
      );
      return { s3Key: strict.s3Key };
    },
  });
}
