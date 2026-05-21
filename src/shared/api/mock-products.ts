import type { ProductCardDto } from "./generated/models/productCardDto";
import type { ProductDetailDto } from "./generated/models/productDetailDto";

export const MOCK_PRODUCTS_CARDS: ProductCardDto[] = [
  {
    id: "prod-001-ceramics",
    title: "Керамічний птах спокою",
    slug: "keramichnyi-ptakh-spokoiu",
    priceUah: "850.00",
    type: "PHYSICAL",
    thumbnailUrl: "/images/home/hero/poster-1.webp",
    author: {
      studentId: "student-olena",
      firstName: "Олена",
      grade: "11-А",
    },
  },
  {
    id: "prod-002-graphics",
    title: "Графіка · Тінь Оболоні",
    slug: "hrafika-tin-oboloni",
    priceUah: "450.00",
    type: "PHYSICAL",
    thumbnailUrl: "/images/home/hero/poster-2.webp",
    author: {
      studentId: "student-marta",
      firstName: "Марта",
      grade: "11-А",
    },
  },
  {
    id: "prod-003-textile",
    title: "Текстильний вітраж весни",
    slug: "tekstylnyi-vitrazh-vesny",
    priceUah: "1200.00",
    type: "PHYSICAL",
    thumbnailUrl: "/images/home/hero/poster-3.webp",
    author: {
      studentId: "student-taras",
      firstName: "Тарас",
      grade: "10-Б",
    },
  },
  {
    id: "prod-004-pastel",
    title: "Пастельний соняшник",
    slug: "pastelyna-soniashnyk",
    priceUah: "300.00",
    type: "PHYSICAL",
    thumbnailUrl: "/images/home/moodboard/scattered-1.webp",
    author: {
      studentId: "student-anna",
      firstName: "Анна",
      grade: "9-В",
    },
  },
  {
    id: "prod-005-clay",
    title: "Глиняний глек непокори",
    slug: "hlynyanyi-hlek-nepokory",
    priceUah: "600.00",
    type: "PHYSICAL",
    thumbnailUrl: "/images/home/moodboard/scattered-2.webp",
    author: {
      studentId: "student-maksym",
      firstName: "Максим",
      grade: "11-Б",
    },
  },
  {
    id: "prod-006-thread",
    title: "Ниткова симфонія життя",
    slug: "nitkova-symfoniia-zhytiia",
    priceUah: "950.00",
    type: "PHYSICAL",
    thumbnailUrl: "/images/home/moodboard/scattered-3.webp",
    author: {
      studentId: "student-olena",
      firstName: "Олена",
      grade: "11-А",
    },
  },
];

export const MOCK_PRODUCTS_DETAILS: Record<string, ProductDetailDto> = {
  "keramichnyi-ptakh-spokoiu": {
    id: "prod-001-ceramics",
    title: "Керамічний птах спокою",
    slug: "keramichnyi-ptakh-spokoiu",
    description:
      "<p>Ця робота була створена під час тривалого весняного семестру на уроках кераміки. Птах символізує спокій та затишок київської Оболоні. Робота двічі покрита кольоровою поливою та випалена при температурі 1050 градусів.</p><p>Чудово прикрасить робочий стіл чи книжкову полицю у вашому кабінеті.</p>",
    priceUah: "850.00",
    type: "PHYSICAL",
    stockQty: 1,
    viewCount: 147,
    imageUrls: ["/images/home/hero/poster-1.webp"],
    author: {
      studentId: "student-olena",
      firstName: "Олена",
      grade: "11-А",
    },
  },
  "hrafika-tin-oboloni": {
    id: "prod-002-graphics",
    title: "Графіка · Тінь Оболоні",
    slug: "hrafika-tin-oboloni",
    description:
      "<p>Складна лінійна графіка тушшю та пером на щільному фактурному папері. Робота відображає архітектурну симетрію та світлотінь залізобетонних масивів Оболоні в променях західного сонця.</p><p>Поставляється в дерев'яній рамі під склом.</p>",
    priceUah: "450.00",
    type: "PHYSICAL",
    stockQty: 1,
    viewCount: 88,
    imageUrls: ["/images/home/hero/poster-2.webp"],
    author: {
      studentId: "student-marta",
      firstName: "Марта",
      grade: "11-А",
    },
  },
  "tekstylnyi-vitrazh-vesny": {
    id: "prod-003-textile",
    title: "Текстильний вітраж весни",
    slug: "tekstylnyi-vitrazh-vesny",
    description:
      "<p>Унікальний художній текстиль, виконаний у техніці вільного розпису шовку (батік) з аплікацією вовняних ниток. Яскраві кольори нагадують про перші травневі грози та цвітіння каштанів на вулицях Києва.</p><p>Призначено для настінного панно.</p>",
    priceUah: "1200.00",
    type: "PHYSICAL",
    stockQty: 1,
    viewCount: 231,
    imageUrls: ["/images/home/hero/poster-3.webp"],
    author: {
      studentId: "student-taras",
      firstName: "Тарас",
      grade: "10-Б",
    },
  },
  "pastelyna-soniashnyk": {
    id: "prod-004-pastel",
    title: "Пастельний соняшник",
    slug: "pastelyna-soniashnyk",
    description:
      "<p>Ніжна та насичена робота сухою пастеллю на спеціальному шорсткому папері. Передає відчуття теплого серпневого полудня та безкрайнього українського поля.</p><p>Потребує оформлення під скло з паспарту.</p>",
    priceUah: "300.00",
    type: "PHYSICAL",
    stockQty: 1,
    viewCount: 64,
    imageUrls: ["/images/home/moodboard/scattered-1.webp"],
    author: {
      studentId: "student-anna",
      firstName: "Анна",
      grade: "9-В",
    },
  },
  "hlynyanyi-hlek-nepokory": {
    id: "prod-005-clay",
    title: "Глиняний глек непокори",
    slug: "hlynyanyi-hlek-nepokory",
    description:
      "<p>Традиційний глиняний глек ручного гончарства, декорований ангобами та рельєфним орнаментом. Це експеримент з текстурами та об'ємами, натхненний трипільською культурою.</p><p>Повністю функціональний, може використовуватись для квітів чи напоїв.</p>",
    priceUah: "600.00",
    type: "PHYSICAL",
    stockQty: 1,
    viewCount: 112,
    imageUrls: ["/images/home/moodboard/scattered-2.webp"],
    author: {
      studentId: "student-maksym",
      firstName: "Максим",
      grade: "11-Б",
    },
  },
  "nitkova-symfoniia-zhytiia": {
    id: "prod-006-thread",
    title: "Ниткова симфонія життя",
    slug: "nitkova-symfoniia-zhytiia",
    description:
      "<p>Експериментальне панно зі змішаних текстильних матеріалів, льону, бавовняних шнурів та металевих кілець. Символізує нерозривність спогадів, зв'язків та дитячої творчості.</p><p>Стане ексклюзивним акцентом у сучасному мінімалістичному інтер'єрі.</p>",
    priceUah: "950.00",
    type: "PHYSICAL",
    stockQty: 1,
    viewCount: 95,
    imageUrls: ["/images/home/moodboard/scattered-3.webp"],
    author: {
      studentId: "student-olena",
      firstName: "Олена",
      grade: "11-А",
    },
  },
};
