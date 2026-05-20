import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot } from "@/shared/ui";

export function AuthorProfileScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ПРОФАЙЛ-FEATURE</EditorialLabel>

      <section aria-label="Hero portrait" className="-mx-5 md:-mx-6">
        <ImageSlot
          slot={`authors/${id}/hero/big`}
          ratio="16/9"
          variant="portrait"
          caption={`Портрет автора ${id}`}
        />
      </section>

      <h1 className="mt-6 font-display text-mega italic text-burgundy">Автор: {id}</h1>
      <p className="max-w-prose text-body text-ink-soft">Учнівські роботи з архіву Ліцею №157.</p>

      <EditorialDivider />

      <h2 className="font-display text-h2 italic">Роботи</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ImageSlot
            key={i}
            slot={`authors/${id}/work/thumb-${i}`}
            ratio="1/1"
            variant="photo-print"
            caption={`Робота ${i}`}
          />
        ))}
      </div>
    </EditorialPageShell>
  );
}
