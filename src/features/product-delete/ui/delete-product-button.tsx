"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  PillButton,
  FormFooter,
  toast,
} from "@/shared/ui";
import { useDeleteProduct } from "@/features/product-delete/model/use-delete-product";

export function DeleteProductButton({ productId, title }: { productId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const m = useDeleteProduct();
  return (
    <>
      <PillButton variant="ghost" onClick={() => setOpen(true)}>
        Видалити
      </PillButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Видалити роботу?</DialogTitle>
          <DialogDescription>«{title}» буде видалено. Цю дію не скасувати.</DialogDescription>
          <FormFooter>
            <PillButton variant="ghost" onClick={() => setOpen(false)}>
              Скасувати
            </PillButton>
            <PillButton
              loading={m.isPending}
              onClick={() =>
                m.mutate(productId, {
                  onSuccess: () => {
                    toast.success("Роботу видалено");
                    setOpen(false);
                  },
                })
              }
            >
              Так, видалити
            </PillButton>
          </FormFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
