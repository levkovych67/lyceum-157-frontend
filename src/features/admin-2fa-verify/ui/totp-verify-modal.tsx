"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  PillButton,
  FormField,
  Input,
  Form,
  FormFooter,
} from "@/shared/ui";

export function TotpVerifyModal({
  open,
  onOpenChange,
  onSubmit,
  error,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (code: string) => void;
  error?: string;
  loading?: boolean;
}) {
  const [code, setCode] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>🔐 АДМІН-ВЕРИФІКАЦІЯ</DialogTitle>
        <DialogDescription>Введіть 6-значний код з Authy/Google Authenticator</DialogDescription>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(code);
          }}
          className="mt-4"
        >
          <FormField name="code" label="Код" required error={error}>
            <Input
              inputMode="numeric"
              maxLength={8}
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center font-mono tracking-[0.4em]"
            />
          </FormField>
          <FormFooter>
            <PillButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Скасувати
            </PillButton>
            <PillButton type="submit" loading={loading} disabled={code.length < 6}>
              Підтвердити
            </PillButton>
          </FormFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
