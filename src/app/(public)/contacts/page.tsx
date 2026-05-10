import type { Metadata } from "next";
import { ContactsScreen } from "@/views/contacts";
import { JsonLd, contactPageSchema, breadcrumbSchema } from "@/shared/seo";

export const metadata: Metadata = {
  title: "Контакти — як знайти Ліцей №157 в Києві",
  description:
    "Адреса, телефон і email Ліцею №157, Київ, проспект Героїв Сталінграда 23А, район Оболонь. Як дістатись і коли працює майстерня.",
  alternates: { canonical: "/contacts" },
  openGraph: {
    title: "Контакти · Майстерня 157",
    description: "Київ · Оболонь · проспект Героїв Сталінграда 23А.",
    url: "/contacts",
  },
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          contactPageSchema(),
          breadcrumbSchema([
            { name: "Головна", url: "/" },
            { name: "Контакти", url: "/contacts" },
          ]),
        ]}
      />
      <ContactsScreen />
    </>
  );
}
