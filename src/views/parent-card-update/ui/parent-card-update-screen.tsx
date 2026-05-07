"use client";
import { EditorialLabel } from "@/shared/ui";
import { KycCardUpdateForm } from "@/features/kyc-card-update";

export function ParentCardUpdateScreen({ token }: { token: string }) {
  return (
    <div className="space-y-6 py-10">
      <EditorialLabel color="burgundy">ОНОВЛЕННЯ КАРТКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оновити картку для виплат</h1>
      <KycCardUpdateForm token={token} />
    </div>
  );
}
