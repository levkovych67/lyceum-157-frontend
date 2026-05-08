import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot } from "@/shared/ui";

export function ContactsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>КОЛОФОН</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Як знайти ліцей</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ImageSlot
          slot="contacts/map/paper"
          ratio="3/2"
          variant="plain"
          caption="Мапа — Київ, Оболонь"
        />
        <ImageSlot
          slot="contacts/building/photo"
          ratio="4/5"
          variant="photo-print"
          caption="Фасад ліцею"
        />
      </div>
      <EditorialDivider />
      <address className="text-body not-italic text-ink-soft">
        м. Київ, проспект Героїв Сталінграда 23А
        <br />
        +38 044 000 00 00
        <br />
        info@lyceum157.ua
      </address>
    </EditorialPageShell>
  );
}
