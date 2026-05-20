"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";

/** Sends an already-authenticated visitor away from /login to their role home. */
export function RedirectIfAuthenticated() {
  const { status, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(role === "ADMIN" ? "/admin" : "/account");
  }, [status, role, router]);
  return null;
}
