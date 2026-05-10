import type { Metadata } from "next";
import { RegisterScreen } from "@/views/register";

export const metadata: Metadata = {
  title: "Реєстрація · Майстерня 157",
  description: "Реєстрація учня художнього класу Ліцею №157.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <RegisterScreen />;
}
