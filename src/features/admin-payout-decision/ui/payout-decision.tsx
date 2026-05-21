"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Form,
  FormField,
  Input,
  Textarea,
  PillButton,
  FormFooter,
  toast,
} from "@/shared/ui";
import { ApiError } from "@/shared/api";
// eslint-disable-next-line boundaries/element-types
import { TotpVerifyModal } from "@/features/admin-2fa-verify";
import {
  useApprovePayout,
  useRejectPayout,
} from "@/features/admin-payout-decision/model/use-payout-decision";

export function PayoutDecision({ payoutId }: { payoutId: string }) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const approveM = useApprovePayout();
  const rejectM = useRejectPayout();

  async function onApprove(totp: string) {
    setError(undefined);
    try {
      await approveM.mutateAsync({ id: payoutId, code: totp });
      toast.success("Виплату схвалено");
      setApproveOpen(false);
    } catch (e) {
      if (e instanceof ApiError && e.isUnauthorized) setError("Неправильний код, спробуй ще");
      else throw e;
    }
  }

  async function onReject(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    try {
      await rejectM.mutateAsync({ id: payoutId, reason, code });
      toast.success("Виплату відхилено");
      setRejectOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) setError("Неправильний код, спробуй ще");
      else throw err;
    }
  }

  return (
    <div className="flex gap-2">
      <PillButton variant="outline-d" onClick={() => setApproveOpen(true)}>
        Схвалити
      </PillButton>
      <PillButton variant="ghost" onClick={() => setRejectOpen(true)}>
        Відхилити
      </PillButton>

      <TotpVerifyModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onSubmit={onApprove}
        error={error}
        loading={approveM.isPending}
      />

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogTitle>Відхилити виплату</DialogTitle>
          <DialogDescription>Вкажи причину та підтверди 2FA-кодом.</DialogDescription>
          <Form onSubmit={onReject} className="mt-4">
            <FormField name="reason" label="Причина (10–500 символів)" required>
              <Textarea
                rows={3}
                value={reason}
                onChange={(ev) => setReason(ev.target.value)}
                minLength={10}
                maxLength={500}
              />
            </FormField>
            <FormField name="code" label="2FA-код" required error={error}>
              <Input
                inputMode="numeric"
                maxLength={8}
                autoComplete="one-time-code"
                value={code}
                onChange={(ev) => setCode(ev.target.value)}
                className="text-center font-mono tracking-[0.4em]"
              />
            </FormField>
            <FormFooter>
              <PillButton type="button" variant="ghost" onClick={() => setRejectOpen(false)}>
                Скасувати
              </PillButton>
              <PillButton
                type="submit"
                loading={rejectM.isPending}
                disabled={reason.length < 10 || code.length < 6}
              >
                Відхилити виплату
              </PillButton>
            </FormFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
