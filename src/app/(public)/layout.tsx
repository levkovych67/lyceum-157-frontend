import type { ReactNode } from "react";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import { RouteTransition } from "@/shared/ui";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative z-10 min-h-[calc(100vh-124px)] overflow-x-hidden pt-[100px] md:pt-[124px]">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <Footer />
    </>
  );
}
