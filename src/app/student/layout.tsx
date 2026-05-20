"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { RoleGateSplash, RoleSectionShell } from "@/widgets/role-section-shell";

export const dynamic = "force-dynamic";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { status, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (role !== "STUDENT") {
      router.replace("/");
      return;
    }
  }, [status, role, router]);
  if (status !== "authenticated" || role !== "STUDENT") return <RoleGateSplash />;
  return <RoleSectionShell role="student">{children}</RoleSectionShell>;
}
