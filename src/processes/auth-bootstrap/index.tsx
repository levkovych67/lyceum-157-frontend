"use client";
import { useEffect } from "react";
import { tryRefresh } from "@/shared/api/refresh";

export function AuthBootstrap() {
  useEffect(() => {
    void tryRefresh();
  }, []);
  return null;
}
