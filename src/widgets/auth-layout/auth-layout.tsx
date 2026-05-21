import type { ReactNode } from "react";
import { Container, ImageSlot } from "@/shared/ui";
import { cn } from "@/shared/lib";

export type AuthLayoutProps = {
  /** Вміст колонки-форми. */
  children: ReactNode;
  /** Slot-id фото для `ImageSlot`. */
  photoSlot: string;
  /** Підпис фото (обовʼязковий для `ImageSlot`). */
  photoCaption: string;
  /** Реальне зображення фото-колонки; без нього `ImageSlot` показує placeholder. */
  photoSrc?: string;
  /** З якого боку фото-колонка. Дефолт — справа. */
  photoSide?: "left" | "right";
};

export function AuthLayout({
  children,
  photoSlot,
  photoCaption,
  photoSrc,
  photoSide = "right",
}: AuthLayoutProps) {
  const photo = (
    <div data-auth-col className="relative hidden md:block">
      <ImageSlot
        slot={photoSlot}
        src={photoSrc}
        ratio="3/4"
        variant="portrait"
        caption={photoCaption}
        className="h-full w-full object-cover"
      />
    </div>
  );
  const form = (
    <div data-auth-col className="flex justify-center md:justify-start">
      {children}
    </div>
  );

  return (
    <section className="py-7 md:py-9">
      <Container>
        <div
          data-testid="auth-grid"
          className={cn(
            "grid grid-cols-1 items-center gap-10 md:gap-14",
            photoSide === "left" ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]",
          )}
        >
          {photoSide === "left" ? (
            <>
              {photo}
              {form}
            </>
          ) : (
            <>
              {form}
              {photo}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
