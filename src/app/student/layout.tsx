"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { RoleGateSplash, RoleSectionShell } from "@/widgets/role-section-shell";

export const dynamic = "force-dynamic";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role !== "STUDENT") {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, role, router]);
  if (!isAuthenticated || role !== "STUDENT") return <RoleGateSplash />;
  return <RoleSectionShell role="student">{children}</RoleSectionShell>;
}
