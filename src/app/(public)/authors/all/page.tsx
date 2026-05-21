import type { Metadata } from "next";
import { AuthorsListScreen } from "@/views/authors-list";

export const metadata: Metadata = {
  title: "Автори — учні художнього класу Ліцею №157",
  description:
    "Учні Ліцею №157 у Києві, чиї роботи зберігаються в архіві Майстерні 157: кераміка, графіка, текстиль, живопис.",
  alternates: { canonical: "/authors/all" },
  openGraph: {
    title: "Автори · Майстерня 157",
    description: "Учні художнього класу Ліцею №157, Київ.",
    url: "/authors/all",
  },
};

export const revalidate = 600;

export default function Page() {
  return <AuthorsListScreen />;
}
