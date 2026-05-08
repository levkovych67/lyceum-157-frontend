"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";

export function StudentProductEditScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>РЕДАГУВАННЯ ЧЕРНЕТКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Робота {id}</h1>
      <ImageSlot
        slot="student/upload/art"
        ratio="4/5"
        variant="photo-print"
        caption="Прев'ю фото"
        className="md:w-64"
      />
      <p className="text-body text-ink-soft">Форма редагування зʼявиться тут.</p>
    </EditorialPageShell>
  );
}
