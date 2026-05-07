"use client";
import { Sticker } from "@/shared/ui";

export function PageStubBanner({ cluster }: { cluster: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <Sticker color="yellow" rotation={-2} signature={`— до брейншторму "${cluster}"`}>
      <span aria-hidden className="mr-2 font-bold">
        ▌
      </span>
      Цю сторінку буде полірувати в окремому брейнштормі.
    </Sticker>
  );
}
