import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { MOCK_PRODUCTS_CARDS } from "@/shared/api/mock-products";

type Author = { studentId: string; firstName: string; grade: string; thumb: string };

/** Унікальні автори, виведені з карток робіт (із зображенням першої роботи). */
function uniqueAuthors(): Author[] {
  const map = new Map<string, Author>();
  for (const p of MOCK_PRODUCTS_CARDS) {
    const a = p.author;
    if (a?.studentId && !map.has(a.studentId)) {
      map.set(a.studentId, {
        studentId: a.studentId,
        firstName: a.firstName ?? "Учень",
        grade: a.grade ?? "",
        thumb: p.thumbnailUrl ?? "/images/home/hero/poster-1.webp",
      });
    }
  }
  return [...map.values()];
}

/** Реальні зображення робіт із архіву — Ч/Б стіна hero. */
const WALL_IMAGES = [
  "/images/home/hero/poster-1.webp",
  "/images/home/hero/poster-2.webp",
  "/images/home/hero/poster-3.webp",
  "/images/home/moodboard/scattered-1.webp",
  "/images/home/moodboard/scattered-2.webp",
  "/images/home/moodboard/scattered-3.webp",
  "/images/catalog/category/tile-1.webp",
  "/images/catalog/category/tile-2.webp",
  "/images/catalog/category/tile-3.webp",
  "/images/collections/tile-1.webp",
  "/images/collections/tile-2.webp",
  "/images/collections/tile-3.webp",
];

export function AuthorsListScreen() {
  const authors = uniqueAuthors();

  return (
    <>
      {/* Hero — Ч/Б стіна робіт + бордовий блок назви */}
      <section
        aria-label="Автори — hero"
        className="relative -mt-[100px] w-full overflow-hidden bg-bg-noir md:-mt-[124px]"
      >
        <div className="grid grid-cols-3 gap-0 pt-[100px] md:grid-cols-6 md:pt-[124px]">
          {WALL_IMAGES.map((src, i) => (
            <ImageSlot
              key={i}
              slot={`authors/wall/${i + 1}`}
              src={src}
              ratio="1/1"
              variant="plain"
              caption="Робота з архіву Майстерні 157"
              sizes="(min-width: 768px) 17vw, 33vw"
              className="contrast-110 h-full w-full object-cover opacity-55 grayscale"
            />
          ))}
        </div>
        {/* Затемнення, щоб бордовий блок назви чітко читався */}
        <div className="from-bg-noir/40 to-bg-noir/75 absolute inset-0 bg-gradient-to-b" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-burgundy px-8 py-6 shadow-deep md:px-12 md:py-8">
            <h1 className="font-display text-display italic leading-none text-bg-warm md:text-mega">
              Автори
            </h1>
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
                  src={a.thumb}
                  ratio="1/1"
                  variant="photo-print"
                  caption={`Робота автора — ${a.firstName}`}
                  sizes="(min-width: 768px) 22vw, 45vw"
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
