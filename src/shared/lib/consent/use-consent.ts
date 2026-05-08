"use client";
import { useCallback, useEffect, useState } from "react";
import { getConsentDismissed, setConsentDismissed } from "./consent";

export function useConsent() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(getConsentDismissed(document.cookie));
  }, []);

  const dismiss = useCallback(() => {
    setConsentDismissed();
    setDismissed(true);
  }, []);

  return { dismissed, dismiss };
}
