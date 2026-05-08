"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { CreateProductForm } from "@/features/product-create";

export function StudentProductNewScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА РОБОТА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Додати роботу</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr] md:items-start">
        <ImageSlot
          slot="student/upload/art"
          ratio="4/5"
          variant="photo-print"
          caption="Прев'ю першого фото"
          className="md:w-64"
        />
        <CreateProductForm />
      </div>
    </EditorialPageShell>
  );
}
