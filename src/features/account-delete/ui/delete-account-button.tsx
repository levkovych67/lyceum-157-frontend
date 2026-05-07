"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  PillButton,
  FormFooter,
} from "@/shared/ui";
import { useDeleteMe } from "@/features/account-delete/model/use-delete-me";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const m = useDeleteMe();
  return (
    <>
      <PillButton variant="ghost" onClick={() => setOpen(true)}>
        Видалити акаунт
      </PillButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Видалити акаунт назавжди?</DialogTitle>
          <DialogDescription>
            Дані будуть зашифровані за GDPR. Tax-required записи (виплати) житимуть 7 років, але PII
            буде втрачено.
          </DialogDescription>
          <FormFooter>
            <PillButton variant="ghost" onClick={() => setOpen(false)}>
              Скасувати
            </PillButton>
            <PillButton onClick={() => m.mutate()} loading={m.isPending}>
              Так, видалити
            </PillButton>
          </FormFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
