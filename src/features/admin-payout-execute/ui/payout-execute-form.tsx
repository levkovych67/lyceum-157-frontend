"use client";
import { useState } from "react";
import { PillButton, toast } from "@/shared/ui";
// eslint-disable-next-line boundaries/element-types
import { TotpVerifyModal } from "@/features/admin-2fa-verify";
import { useExecutePayouts } from "@/features/admin-payout-execute/model/use-execute";
import { ApiError } from "@/shared/api";

export function PayoutExecuteForm({ payoutIds }: { payoutIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const m = useExecutePayouts();

  const handleSubmit = async (code: string) => {
    setError(undefined);
    try {
      const r = await m.mutateAsync({ payoutIds, code });
      toast.success(`Прийнято: jobId=${r.jobId}. Очікуємо підтвердження банку.`);
      setOpen(false);
    } catch (e) {
      if (e instanceof ApiError && e.isUnauthorized) {
        setError("Неправильний код, спробуйте ще раз");
      } else throw e;
    }
  };

  return (
    <>
      <PillButton onClick={() => setOpen(true)} disabled={!payoutIds.length}>
        Виплатити обрані ({payoutIds.length})
      </PillButton>
      <TotpVerifyModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        error={error}
        loading={m.isPending}
      />
    </>
  );
}
