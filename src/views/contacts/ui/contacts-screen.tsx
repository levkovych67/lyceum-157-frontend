import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";

export function ContactsScreen() {
  return (
    <EditorialPageShell>
      {/* Hero */}
      <section className="relative py-12">
        <EditorialLabel>КОЛОФОН</EditorialLabel>
        <h1 className="mt-4 font-display text-mega italic leading-none text-burgundy">
          Як з нами
          <br />
          зв&apos;язатись
        </h1>
        <div className="absolute right-[5%] top-[20%] hidden md:block">
          <Stamp text="ПОШТА" rotation={12} animateOn="load" className="text-burgundy" />
        </div>
      </section>

      <EditorialDivider />

      <div className="grid grid-cols-1 gap-12 py-8 md:grid-cols-2 md:gap-24 lg:gap-32">
        {/* Left: Contact Info as Museum Labels */}
        <div className="space-y-8">
          <div>
            <EditorialLabel className="mb-4">ФІЗИЧНА АДРЕСА</EditorialLabel>
            <address className="border-l-2 border-burgundy pl-4 text-lead not-italic text-ink">
              м. Київ,
              <br />
              проспект Володимира Івасюка, 23А
              <br />
              <span className="mt-2 block font-mono text-small uppercase text-ink-soft">
                Індекс: 04210
              </span>
            </address>
          </div>

          <div className="border-ink/30 border-t-[1.5px] border-dashed pt-8">
            <EditorialLabel className="mb-4">ТЕЛЕГРАФ ТА ТЕЛЕФОН</EditorialLabel>
            <div className="space-y-2 border-l-2 border-burgundy pl-4 text-lead text-ink">
              <p>+38 044 418 75 08</p>
              <p className="mt-2 font-hand text-hand-m text-green">← телефонувати до 15:00</p>
              <p className="mt-4">info@lyceum157.ua</p>
            </div>
          </div>
        </div>

        {/* Right: Images / Map */}
        <div className="relative">
          <div className="rotate-[2deg] transition-transform hover:rotate-0">
            <ImageSlot
              slot="contacts/map/paper"
              src="/images/contacts/map/paper.png"
              ratio="3/2"
              variant="photo-print"
              caption="Мапа Оболоні"
              className="shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
            />
          </div>
          <div className="absolute -bottom-16 -left-12 z-10 hidden rotate-[-6deg] transition-transform hover:rotate-0 hover:scale-105 md:block">
            <ImageSlot
              slot="contacts/building/photo"
              src="/images/contacts/building/photo.png"
              ratio="1/1"
              variant="polaroid"
              caption="Фасад ліцею"
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* To clear the absolute positioned polaroid */}
      <div className="hidden h-16 md:block"></div>
    </EditorialPageShell>
  );
}
