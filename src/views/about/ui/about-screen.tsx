import { Container, EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";

export function AboutScreen() {
  return (
    <section className="relative overflow-x-hidden bg-bg">
      {/* Full bleed hero section */}
      <section className="relative w-full overflow-hidden border-b border-line-strong bg-burgundy">
        <div className="relative aspect-[16/9] max-h-[500px] w-full md:aspect-[21/9]">
          <ImageSlot
            slot="about/hero/portrait"
            src="/images/about/hero/portrait.webp"
            ratio="21/9"
            variant="plain"
            caption="Hero — фасад ліцею"
            className="h-full w-full scale-105 object-cover opacity-55 mix-blend-multiply contrast-125 grayscale"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
            <EditorialLabel className="border-bg-warm/30 text-bg-warm/80 mb-6 tracking-[0.2em]">
              РЕДАКТОРСЬКА КОЛОНКА
            </EditorialLabel>
            <h1 className="font-display text-mega italic leading-[1.1] text-bg-warm drop-shadow-md">
              Це не магазин.
              <br />
              Це архів.
            </h1>
          </div>
          {/* Stamped Seal "ІСТОРІЯ" or "EST. 1957" in the top-right corner */}
          <div className="absolute right-6 top-6 z-20 md:right-12 md:top-12">
            <Stamp
              text="ІСТОРІЯ"
              shape="octagon"
              rotation={12}
              size={120}
              color="burgundy"
              animateOn="load"
              className="border-bg-warm/30 text-bg-warm opacity-90"
            />
          </div>
        </div>
      </section>

      {/* Main page content wrapped in FSD containers for proper desktop margins */}
      <Container className="py-16 md:py-24">
        <div className="flex flex-col gap-16 md:gap-24">
          {/* Intro Section */}
          <section className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="space-y-8">
              <h2 className="font-display text-h2 italic leading-tight text-burgundy">
                Ліцей №157 — школа з художнім ухилом і спорудою 1957 року.
              </h2>
              <div className="prose space-y-6 text-lead text-ink-soft">
                <p>
                  Кожен учень приносить додому не оцінку, а слід — фізичний обʼєкт, зроблений
                  руками. Цей архів — продовження тієї ж практики онлайн.
                </p>
                <p>
                  Ми збираємо та зберігаємо найкращі твори наших учнів, перетворюючи шкільні
                  майстерні на справжню мистецьку галерею.
                </p>
              </div>
            </div>

            <div className="relative mt-8 flex justify-center lg:mt-0 lg:justify-start">
              <div className="relative">
                <ImageSlot
                  slot="about/spread-1"
                  src="/images/about/spread-1.webp"
                  ratio="4/5"
                  variant="photo-print"
                  caption="Архівне фото — клас образотворчого"
                  className="w-64 rotate-[3deg] shadow-photo transition-transform duration-500 hover:rotate-0"
                />
                <Stamp
                  text="1957"
                  shape="circle"
                  rotation={-15}
                  size={100}
                  animateOn="scroll"
                  className="absolute -bottom-6 -left-6 text-burgundy"
                />
              </div>
            </div>
          </section>

          <EditorialDivider className="mx-auto max-w-5xl" />

          {/* Asymmetric Section */}
          <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 py-4 lg:grid-cols-12 lg:gap-8">
            <div className="flex justify-center lg:col-span-5 lg:col-start-1 lg:justify-start">
              <ImageSlot
                slot="about/spread-2"
                src="/images/about/spread-2.webp"
                ratio="4/5"
                variant="polaroid"
                caption="Майстерня кераміки"
                className="w-full max-w-sm rotate-[-2deg] transition-transform duration-500 hover:rotate-0"
              />
            </div>
            <div className="flex flex-col justify-center text-center lg:col-span-6 lg:col-start-7 lg:text-left">
              <p className="mb-6 font-hand text-hand-l leading-relaxed text-ink">
                «Я хочу, щоб мої роботи були справжніми, щоб їх можна було потримати в руках.»
              </p>
              <p className="font-display text-body italic text-ink-soft">
                — З інтерв&apos;ю учнів, випуск 2026
              </p>
            </div>
          </section>

          <EditorialDivider className="mx-auto max-w-5xl" />

          {/* Signature Section */}
          <section className="flex flex-col items-center gap-8 py-8">
            <div className="relative">
              <ImageSlot
                slot="about/sign/photo"
                src="/images/about/sign/photo.webp"
                ratio="1/1"
                variant="portrait"
                caption="Підпис директорки"
                className="border-line-strong/60 h-36 w-36 rounded-full border-2 shadow-photo grayscale"
              />
            </div>

            <div className="relative mt-4 max-w-xs text-center">
              {/* Autographed signature overlay on top of a realistic signature line */}
              <div className="relative mx-auto mb-2 flex h-12 w-64 items-center justify-center">
                <span className="absolute bottom-4 -rotate-2 select-none font-hand text-[40px] italic text-burgundy opacity-95">
                  О. Поляновська
                </span>
                <div className="bg-ink/30 absolute bottom-2 left-0 right-0 h-[1.5px]" />
              </div>
              <p className="font-display text-small uppercase tracking-widest text-ink-soft">
                Олена Поляновська
              </p>
              <p className="mt-1 font-body text-[11px] uppercase tracking-wider text-ink-fade">
                Директорка ліцею
              </p>
            </div>
          </section>
        </div>
      </Container>
    </section>
  );
}
