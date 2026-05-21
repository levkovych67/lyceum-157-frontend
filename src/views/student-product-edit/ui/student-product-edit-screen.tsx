"use client";
import { useQuery } from "@tanstack/react-query";
import { detail } from "@/shared/api/generated/student-products/student-products";
import { studentKeys } from "@/shared/api/student-keys";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, PillButton, toast } from "@/shared/ui";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
import { ProductStatusBadge } from "@/entities/product";
import { EditProductForm } from "@/features/product-edit";
import { ImageManager } from "@/features/product-image-upload";
import { useSubmitProduct } from "@/features/product-submit";

export function StudentProductEditScreen({ id }: { id: string }) {
  const q = useQuery({ queryKey: studentKeys.product(id), queryFn: () => detail(id) });
  const submitMutation = useSubmitProduct();
  const product = q.data;
  const status = product?.status;
  const editable = status === "DRAFT" || status === "REJECTED";

  return (
    <EditorialPageShell>
      <EditorialLabel>РЕДАГУВАННЯ РОБОТИ</EditorialLabel>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-h1 italic text-burgundy">{product?.title ?? "Робота"}</h1>
        {status ? <ProductStatusBadge status={status} /> : null}
      </div>

      {q.isLoading ? (
        <PaperSkeletonForm />
      ) : q.isError || !product ? (
        <p className="text-body text-burgundy">Не вдалось завантажити роботу.</p>
      ) : (
        <>
          {status === "REJECTED" && product.rejectionReason ? (
            <div className="border border-burgundy bg-bg-card p-4">
              <p className="font-mono text-[11px] uppercase tracking-wide text-burgundy">
                Причина відхилення
              </p>
              <p className="text-body text-ink">{product.rejectionReason}</p>
            </div>
          ) : null}

          {!editable ? (
            <p className="text-body text-ink-soft">
              Цю роботу вже опубліковано — редагувати не можна. Доступні дії — на сторінці «Мої
              роботи».
            </p>
          ) : null}

          {editable ? <EditProductForm product={product} /> : null}

          <EditorialDivider />
          <EditorialLabel>ФОТО РОБОТИ</EditorialLabel>
          <ImageManager productId={id} images={product.images ?? []} editable={editable} />

          {editable ? (
            <>
              <EditorialDivider />
              <div className="flex flex-col gap-2">
                <PillButton
                  loading={submitMutation.isPending}
                  onClick={() =>
                    submitMutation.mutate(
                      { id, mode: status === "REJECTED" ? "resubmit" : "submit" },
                      { onSuccess: () => toast.success("Роботу подано на розгляд") },
                    )
                  }
                >
                  {status === "REJECTED" ? "Подати знову на розгляд" : "Подати на розгляд"}
                </PillButton>
                <p className="font-mono text-[11px] text-ink-soft">
                  Перед поданням переконайся, що додав хоча б одне фото.
                </p>
              </div>
            </>
          ) : null}
        </>
      )}
    </EditorialPageShell>
  );
}
