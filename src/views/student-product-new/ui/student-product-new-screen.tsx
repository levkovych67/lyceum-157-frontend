"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import { CreateProductForm } from "@/features/product-create";

export function StudentProductNewScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА РОБОТА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Додати роботу</h1>
      <CreateProductForm />
    </EditorialPageShell>
  );
}
