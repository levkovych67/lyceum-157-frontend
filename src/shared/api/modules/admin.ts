import { api } from "@/shared/api/client";
import type { Page } from "@/shared/api/types";
import type { ProductType } from "./catalog";

export type ProductStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "REJECTED"
  | "HIDDEN"
  | "DELETED";

export type AdminProductDto = {
  id: string;
  title: string;
  slug: string | null;
  descriptionPlain: string;
  priceUah: string;
  type: ProductType;
  stockQty: number;
  status: ProductStatus;
  rejectionReason: string | null;
  studentId: string;
  studentFullName: string;
  studentGrade: string;
  kycSigned: boolean;
  createdAt: string;
};

export type TotpEnrollResponse = {
  qrCodeDataUri: string;
  secretBase32: string;
  recoveryCodes: string[];
};

export type PayoutBatchRequest = { payoutIds: string[] };
export type PayoutBatchResponse = { processedCount: number; jobId: string; message: string };

const qs = (o: Record<string, unknown>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

export const adminApi = {
  twoFa: {
    enroll: () => api<TotpEnrollResponse>("/admin/2fa/enroll", { method: "POST" }),
    confirm: (code: string) =>
      api<void>("/admin/2fa/confirm", { method: "POST", body: JSON.stringify({ code }) }),
    verify: (code: string) =>
      api<{ valid: boolean }>("/admin/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
  },
  products: {
    list: (status?: ProductStatus, page = 0, size = 50) =>
      api<Page<AdminProductDto>>(`/admin/products?${qs({ status, page, size })}`),
    approve: (id: string) =>
      api<AdminProductDto>(`/admin/products/${id}/approve`, { method: "POST" }),
    reject: (id: string, reason: string) =>
      api<AdminProductDto>(`/admin/products/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  },
  orders: {
    refund: (orderId: string, reason: string) =>
      api<void>(`/admin/orders/${orderId}/refund`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  },
  payouts: {
    execute: (payoutIds: string[], totp: string) =>
      api<PayoutBatchResponse>("/admin/payouts/execute", {
        method: "POST",
        body: JSON.stringify({ payoutIds }),
        totp,
      }),
  },
};

export async function downloadTaxReport(
  from: string,
  to: string,
  accessToken: string,
): Promise<void> {
  const r = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/admin/payouts/export/tax-report?from=${from}&to=${to}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!r.ok) throw new Error(`Tax report HTTP ${r.status}`);
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `4DF_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
