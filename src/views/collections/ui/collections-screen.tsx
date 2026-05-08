import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";

export function CollectionsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ТЕМАТИЧНІ СПЕЦВИПУСКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Колекції</h1>

      <ImageSlot slot="collections/hero" ratio="16/9" variant="interlude" caption="Hero колекцій" />

      <EditorialDivider />

      <section aria-label="Колекції" className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ImageSlot
          slot="collections/tile-1"
          ratio="4/5"
          variant="photo-print"
          caption="Шевченківські дні"
        />
        <ImageSlot
          slot="collections/tile-2"
          ratio="4/5"
          variant="photo-print"
          caption="Випуск 11-А"
        />
        <ImageSlot
          slot="collections/tile-3"
          ratio="4/5"
          variant="photo-print"
          caption="Літня практика"
        />
        <ImageSlot
          slot="collections/tile-4"
          ratio="4/5"
          variant="photo-print"
          caption="Архів 2024"
        />
      </section>

      <EditorialDivider />

      <div className="flex flex-col items-center gap-4">
        <ImageSlot
          slot="collections/decorative/stamp"
          ratio="1/1"
          variant="stamp"
          caption="Архівна печатка"
          className="w-32"
        />
        <Stamp text="АРХІВ ЛІЦЕЮ 157" rotation={-5} />
      </div>
    </EditorialPageShell>
  );
}
