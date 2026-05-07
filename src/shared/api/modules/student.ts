import { api } from "@/shared/api/client";
import type { ProductType } from "./catalog";
import type { PresignedUploadDto } from "@/shared/api/upload-s3";

export type CreateProductRequest = {
  title: string;
  description: string;
  priceUah: string;
  type: ProductType;
  stockQty: number;
};
export type EditProductRequest = { title: string; description: string; priceUah: string };
export type ConfirmImageRequest = {
  s3Key: string;
  declaredMimeType: "image/jpeg" | "image/png" | "image/webp";
  primary: boolean;
};
export type FinanceSummaryDto = {
  totalGross: string;
  totalTaxes: string;
  totalNetEarned: string;
  pendingHold: string;
  pendingApproved: string;
};

export const studentApi = {
  products: {
    create: (b: CreateProductRequest) =>
      api<{ id: string }>("/student/products", { method: "POST", body: JSON.stringify(b) }),
    edit: (id: string, b: EditProductRequest) =>
      api<void>(`/student/products/${id}`, { method: "PUT", body: JSON.stringify(b) }),
    submit: (id: string) => api<void>(`/student/products/${id}/submit`, { method: "POST" }),
    hide: (id: string) => api<void>(`/student/products/${id}/hide`, { method: "POST" }),
    unhide: (id: string) => api<void>(`/student/products/${id}/unhide`, { method: "POST" }),
    delete: (id: string) => api<void>(`/student/products/${id}`, { method: "DELETE" }),
    uploadUrl: (id: string, contentType: "image/jpeg" | "image/png" | "image/webp") =>
      api<PresignedUploadDto>(`/student/products/${id}/images/upload-url`, {
        method: "POST",
        body: JSON.stringify({ contentType }),
      }),
    confirmImg: (id: string, b: ConfirmImageRequest) =>
      api<void>(`/student/products/${id}/images/confirm`, {
        method: "POST",
        body: JSON.stringify(b),
      }),
  },
  finance: {
    summary: () => api<FinanceSummaryDto>("/student/finance/summary"),
  },
};
