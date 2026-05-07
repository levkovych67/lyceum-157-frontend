"use client";
import { Sticker } from "@/shared/ui";

export function PageStubBanner({ cluster }: { cluster: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <Sticker color="yellow" rotation={-2} signature={`— до брейншторму "${cluster}"`}>
      🚧 Цю сторінку буде полірувати в окремому брейнштормі.
    </Sticker>
  );
}
