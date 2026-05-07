import Link from "next/link";
import { Container, EditorialDivider, EditorialLabel, PostageStamp, Stamp } from "@/shared/ui";

export function Footer() {
  return (
    <footer className="border-ink/30 relative mt-20 border-t-2 border-dashed bg-bg pt-10">
      <Container>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="font-hand text-hand-l text-burgundy">Дорогий друже,</p>
            <p className="mt-3 max-w-md text-body text-ink">
              Ми пишемо тобі з Майстерні 157. Тут, на проспекті Оболонському, 1351 учень щодня щось
              створює. Заходь, коли матимеш час.
            </p>
            <p className="mt-6 font-display italic text-burgundy">— команда Ліцею №157</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <PostageStamp />
            <div className="flex gap-3">
              <Stamp
                text="АРХІВ ЛІЦЕЮ 157"
                shape="octagon"
                rotation={-3}
                size={80}
                animateOn="scroll"
              />
              <Stamp
                text="ПЕРЕДАНО З ОБОЛОНІ"
                shape="circle"
                rotation={5}
                size={80}
                animateOn="scroll"
              />
            </div>
            <address className="text-right text-small not-italic text-ink-soft">
              пр. Оболонський, 12в
              <br />
              +38 (044) 418-75-08
              <br />
              obolon_157@i.ua
            </address>
          </div>
        </div>
        <EditorialDivider variant="dashed" className="my-8" />
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 text-small">
          <EditorialLabel>© ЛІЦЕЙ 157 · 2026 · ОБОЛОНЬ</EditorialLabel>
          <nav className="flex gap-5 text-ink-soft">
            <Link href="/catalog">Каталог</Link>
            <Link href="/collections">Колекції</Link>
            <Link href="/about">Про</Link>
            <Link href="/contacts">Контакти</Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
