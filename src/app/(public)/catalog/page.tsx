import type { Metadata } from "next";
import { CatalogScreen } from "@/views/catalog";

export const metadata: Metadata = { title: "Каталог" };
export const revalidate = 300;

export default function Page() {
  return <CatalogScreen />;
}
