import type { Metadata } from "next";
import { HomeScreen } from "@/views/home";

export const metadata: Metadata = { title: "Майстерня 157" };
export const revalidate = 300;

export default function Page() {
  return <HomeScreen />;
}
