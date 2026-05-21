import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { MOCK_PRODUCTS_CARDS } from "@/shared/api/mock-products";

type Author = { studentId: string; firstName: string; grade: string };

/** Унікальні автори, виведені з карток робіт. */
function uniqueAuthors(): Author[] {
  const map = new Map<string, Author>();
  for (const p of MOCK_PRODUCTS_CARDS) {
    const a = p.author;
    if (a?.studentId && !map.has(a.studentId)) {
      map.set(a.studentId, {
        studentId: a.studentId,
        firstName: a.firstName ?? "Учень",
        grade: a.grade ?? "",
      });
    }
  }
  return [...map.values()];
}

export function AuthorsListScreen() {
  const authors = uniqueAuthors();
  // Стіна-hero завжди має 12 кліток — повторюємо авторів по колу.
  const wall = Array.from({ length: 12 }, (_, i) => authors[i % authors.length]!);

  return (
    <>
      {/* Hero — стіна Ч/Б портретів + бордовий блок назви */}
      <section
        aria-label="Автори — hero"
        className="relative -mt-[100px] w-full overflow-hidden bg-bg-noir md:-mt-[124px]"
      >
        <div className="grid grid-cols-3 gap-0 pt-[100px] opacity-65 md:grid-cols-6 md:pt-[124px]">
          {wall.map((a, i) => (
            <ImageSlot
              key={`${a.studentId}-${i}`}
              slot={`authors/${a.studentId}/face`}
              ratio="1/1"
              variant="plain"
              caption={`Портрет — ${a.firstName}`}
              className="h-full w-full object-cover contrast-125 grayscale"
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-burgundy px-8 py-6 shadow-deep md:px-12 md:py-8">
            <h1 className="font-display text-mega italic leading-none text-bg-warm">Автори</h1>
          </div>
        </div>
      </section>

      <EditorialPageShell>
        <header>
          <EditorialLabel>▌ Учні художнього класу</EditorialLabel>
          <p className="mt-3 max-w-prose text-body text-ink-soft">
            Кожна робота в архіві Майстерні 157 належить конкретному учневі Ліцею №157. Оберіть
            автора, щоб побачити його роботи.
          </p>
        </header>

        <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {authors.map((a) => (
            <li key={a.studentId}>
              <Link href={`/authors/${a.studentId}`} className="group block">
                <ImageSlot
                  slot={`authors/${a.studentId}/card`}
                  ratio="1/1"
                  variant="photo-print"
                  caption={`Портрет — ${a.firstName}`}
                  className="grayscale transition-all duration-d3 ease-paper group-hover:grayscale-0"
                />
                <p className="mt-3 font-display text-h3 italic text-ink">{a.firstName}</p>
                <p className="font-body text-small uppercase tracking-wider text-ink-soft">
                  {a.grade}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </EditorialPageShell>
    </>
  );
}
