import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";

export function AboutScreen() {
  return (
    <EditorialPageShell>
      {/* Full bleed hero */}
      <section className="-mx-6 mb-16 bg-burgundy md:-mx-12 lg:-mx-24">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <ImageSlot
            slot="about/hero/portrait"
            src="/images/about/hero/portrait.png"
            ratio="21/9"
            variant="plain"
            caption="Hero — фасад ліцею"
            className="h-full w-full object-cover opacity-60 mix-blend-multiply"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <EditorialLabel className="border-bg-warm/30 text-bg-warm/80 mb-6">
              РЕДАКТОРСЬКА КОЛОНКА
            </EditorialLabel>
            <h1 className="font-display text-mega italic text-bg-warm drop-shadow-md">
              Це не магазин.
              <br />
              Це архів.
            </h1>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-12 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <p className="mb-8 font-display text-h2 italic text-burgundy">
            Ліцей №157 — школа з художнім ухилом і спорудою 1957 року.
          </p>
          <div className="prose text-lead text-ink-soft">
            <p>
              Кожен учень приносить додому не оцінку, а слід — фізичний обʼєкт, зроблений руками.
              Цей архів — продовження тієї ж практики онлайн.
            </p>
            <p>
              Ми збираємо та зберігаємо найкращі твори наших учнів, перетворюючи шкільні майстерні
              на справжню мистецьку галерею.
            </p>
          </div>
        </div>

        <div className="relative mt-8 md:mt-0">
          <ImageSlot
            slot="about/spread-1"
            src="/images/about/spread-1.png"
            ratio="4/5"
            variant="photo-print"
            caption="Архівне фото — клас образотворчого"
            className="w-64 rotate-[3deg] shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          />
          <Stamp
            text="1957"
            rotation={-15}
            animateOn="hover"
            className="absolute -bottom-6 -left-6 text-burgundy"
          />
        </div>
      </section>

      <EditorialDivider className="mx-auto max-w-5xl" />

      {/* Asymmetric block */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-12 py-8 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 md:col-start-1">
          <ImageSlot
            slot="about/spread-2"
            src="/images/about/spread-2.png"
            ratio="4/5"
            variant="polaroid"
            caption="Майстерня кераміки"
            className="w-full rotate-[-2deg]"
          />
        </div>
        <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
          <p className="mb-6 font-hand text-hand-l text-ink">
            «Я хочу, щоб мої роботи були справжніми, щоб їх можна було потримати в руках.»
          </p>
          <p className="font-display text-body italic text-ink-soft">
            — З інтерв&apos;ю учнів, випуск 2026
          </p>
        </div>
      </section>

      <EditorialDivider className="mx-auto max-w-5xl" />

      {/* Signature */}
      <section className="flex flex-col items-center gap-6 py-12">
        <ImageSlot
          slot="about/sign/photo"
          src="/images/about/sign/photo.png"
          ratio="1/1"
          variant="portrait"
          caption="Підпис директорки"
          className="w-32 rounded-full grayscale"
        />
        <div className="text-center">
          <p className="-rotate-2 font-hand text-hand-l text-burgundy">Олена Петрівна</p>
          <p className="mt-2 font-display text-small uppercase tracking-widest text-ink-soft">
            Директорка ліцею
          </p>
        </div>
      </section>
    </EditorialPageShell>
  );
}
