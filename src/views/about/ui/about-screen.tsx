import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot } from "@/shared/ui";

export function AboutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>РЕДАКТОРСЬКА КОЛОНКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Ліцей №157 · з 1957</h1>
      <ImageSlot
        slot="about/hero/portrait"
        ratio="16/9"
        variant="interlude"
        caption="Hero — фасад ліцею"
      />
      <EditorialDivider />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <p className="font-display text-h3 italic text-ink">
          Наш ліцей — школа з художнім ухилом і спорудою 1957 року. Ми не магазин — ми архів.
        </p>
        <ImageSlot
          slot="about/spread-1"
          ratio="4/5"
          variant="photo-print"
          caption="Архівне фото — клас образотворчого"
        />
      </div>
      <EditorialDivider />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr] md:items-center">
        <ImageSlot
          slot="about/spread-2"
          ratio="4/5"
          variant="photo-print"
          caption="Архівне фото — майстерня кераміки"
          className="md:w-72"
        />
        <p className="max-w-prose text-body text-ink-soft">
          Кожен учень приносить додому не оцінку, а слід — фізичний обʼєкт, зроблений руками. Цей
          архів — продовження тієї ж практики онлайн.
        </p>
      </div>
      <EditorialDivider />
      <div className="flex flex-col items-center gap-3">
        <ImageSlot
          slot="about/sign/photo"
          ratio="1/1"
          variant="polaroid"
          caption="Підпис директорки"
          className="w-44"
        />
        <p className="font-hand text-h3 text-ink">Олена Петрівна, директорка</p>
      </div>
    </EditorialPageShell>
  );
}
