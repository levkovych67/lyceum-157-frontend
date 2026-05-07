"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { AccountScreen } from "@/views/account";

export default function Page() {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (role === "ADMIN") router.replace("/admin");
  }, [isAuthenticated, role, router]);
  if (!isAuthenticated || role === "ADMIN") return null;
  return <AccountScreen />;
}
