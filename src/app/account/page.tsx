"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { AccountScreen } from "@/views/account";

export default function Page() {
  const { status, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (role === "ADMIN") router.replace("/admin");
  }, [status, role, router]);
  if (status !== "authenticated" || role === "ADMIN") return null;
  return <AccountScreen />;
}
