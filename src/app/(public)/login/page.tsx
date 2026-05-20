import type { Metadata } from "next";
import { LoginScreen } from "@/views/login";
import { RedirectIfAuthenticated } from "./redirect-if-authenticated";

export const metadata: Metadata = {
  title: "Вхід · Майстерня 157",
  description: "Вхід для учнів і адміністраторів Майстерні 157.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <RedirectIfAuthenticated />
      <LoginScreen />
    </>
  );
}
