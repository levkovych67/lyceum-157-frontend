"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { PillButton, toast } from "@/shared/ui";
import type { ImageDto } from "@/shared/api/generated/models/imageDto";
import { useUploadProductImage } from "@/features/product-image-upload/model/use-upload-product-image";
import {
  useRemoveProductImage,
  useReorderProductImages,
} from "@/features/product-image-upload/model/use-image-mutations";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function ImageManager({
  productId,
  images,
  editable,
}: {
  productId: string;
  images: ImageDto[];
  editable: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = useUploadProductImage();
  const remove = useRemoveProductImage(productId);
  const reorder = useReorderProductImages(productId);
  const sorted = [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  function pushOrder(next: ImageDto[], primaryId: string) {
    reorder.mutate({
      images: next.map((img, idx) => ({
        imageId: img.id ?? "",
        sortOrder: idx,
        primary: img.id === primaryId,
      })),
    });
  }

  async function onPick(file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Файл завеликий: максимум 5 МБ");
      return;
    }
    setBusy(true);
    try {
      await upload.mutateAsync({ productId, file, primary: images.length === 0 });
      toast.success("Фото додано");
    } catch {
      toast.error("Не вдалось завантажити фото");
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    const primaryId = sorted.find((i) => i.primary)?.id ?? next[0]?.id ?? "";
    pushOrder(next, primaryId);
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.length === 0 ? (
        <p className="text-body text-ink-soft">Додай фото роботи (JPEG/PNG/WebP).</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((img, idx) => (
            <li key={img.id} className="flex items-center gap-3 border border-line bg-bg-card p-2">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden border border-line">
                <Image src={img.url ?? ""} alt={`Фото ${idx + 1}`} fill className="object-cover" />
              </div>
              {img.primary ? (
                <span className="font-mono text-[11px] uppercase text-green">Головне</span>
              ) : (
                <span className="font-mono text-[11px] uppercase text-ink-soft">#{idx + 1}</span>
              )}
              {editable ? (
                <div className="ml-auto flex gap-1">
                  <PillButton variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0}>
                    ↑
                  </PillButton>
                  <PillButton
                    variant="ghost"
                    onClick={() => move(idx, 1)}
                    disabled={idx === sorted.length - 1}
                  >
                    ↓
                  </PillButton>
                  {!img.primary ? (
                    <PillButton
                      variant="ghost"
                      onClick={() => pushOrder(sorted, img.id ?? "")}
                      loading={reorder.isPending}
                    >
                      Зробити головним
                    </PillButton>
                  ) : null}
                  <PillButton
                    variant="ghost"
                    loading={remove.isPending}
                    onClick={() => remove.mutate(img.id ?? "")}
                  >
                    Видалити
                  </PillButton>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {editable ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPick(f);
              e.target.value = "";
            }}
          />
          <PillButton variant="outline-d" loading={busy} onClick={() => fileRef.current?.click()}>
            + Додати фото
          </PillButton>
        </div>
      ) : null}
    </div>
  );
}
