import { api } from "@/shared/api/client";

export type KycSessionResponse = {
  studentName: string;
  grade: string;
  status: "AWAITING_DETAILS" | "PENDING_SIGNATURE" | "APPROVED";
};
export type KycSubmitRequest = { parentName: string; parentRnokpp: string; payoutCard: string };
export type KycSubmitResponse = {
  status: "PENDING_SIGNATURE";
  signDocumentUrl: string | null;
  expiresAt: string;
};

export const kycApi = {
  peek: (token: string) => api<KycSessionResponse>(`/kyc/session/${token}`, { auth: false }),
  submit: (token: string, body: KycSubmitRequest) =>
    api<KycSubmitResponse>(`/kyc/parents/submit?token=${token}`, {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),
  updateCard: (token: string, payoutCard: string) =>
    api<void>(`/kyc/parents/update-card?token=${token}`, {
      method: "POST",
      body: JSON.stringify({ payoutCard }),
      auth: false,
    }),
};
