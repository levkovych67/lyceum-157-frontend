"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentProductEditScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>РЕДАГУВАННЯ ЧЕРНЕТКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Робота {id}</h1>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
