import type { Metadata } from "next";
import { AuthorProfileScreen } from "@/views/author-profile";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Автор · профіль учня Ліцею №157`,
    description: "Профіль учня художнього класу Ліцею №157 та його роботи в архіві Майстерні 157.",
    alternates: { canonical: `/authors/${params.id}` },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <AuthorProfileScreen id={params.id} />;
}
