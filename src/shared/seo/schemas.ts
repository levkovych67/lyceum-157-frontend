export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const SITE_NAME = "Майстерня 157";
export const SITE_LEGAL_NAME = "Ліцей №157";
export const SITE_LOCALE = "uk_UA";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    alternateName: "Lyceum 157 · Maisternya",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/og.png`,
    description:
      "Архів учнівських робіт Ліцею №157 у Києві. З 1957 року. Кераміка, графіка, текстиль і живопис від учнів художнього класу.",
    foundingDate: "1957",
    address: {
      "@type": "PostalAddress",
      streetAddress: "проспект Героїв Сталінграда, 23А",
      addressLocality: "Київ",
      addressRegion: "Оболонь",
      postalCode: "04210",
      addressCountry: "UA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+380-44-000-0000",
      email: "info@lyceum157.ua",
      contactType: "customer support",
      availableLanguage: ["Ukrainian"],
    },
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "uk-UA",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/catalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type Crumb = { name: string; url: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url.startsWith("http") ? c.url : `${SITE_URL}${c.url}`,
    })),
  };
}

export type ProductSchemaInput = {
  slug: string;
  title: string;
  description: string;
  priceUah: string | number;
  imageUrls: string[];
  authorName?: string;
  authorGrade?: string;
  inStock?: boolean;
};

export function productSchema(p: ProductSchemaInput) {
  const url = `${SITE_URL}/p/${p.slug}`;
  const priceNum = typeof p.priceUah === "number" ? p.priceUah : Number(p.priceUah);
  const price = Number.isFinite(priceNum) ? priceNum.toFixed(2) : String(p.priceUah);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.title,
    description: p.description.replace(/<[^>]+>/g, "").slice(0, 5000),
    image: p.imageUrls,
    url,
    sku: p.slug,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(p.authorName && {
      creator: {
        "@type": "Person",
        name: [p.authorName, p.authorGrade].filter(Boolean).join(", "),
      },
    }),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "UAH",
      price,
      availability:
        p.inStock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function collectionPageSchema(opts: { url: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith("http") ? opts.url : `${SITE_URL}${opts.url}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE_URL}/contacts`,
    name: "Контакти · Майстерня 157",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };
}

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${SITE_URL}/about`,
    name: "Про нас · Майстерня 157",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };
}
