export const CONSENT_COOKIE = "consent_dismissed";

export function getConsentDismissed(cookieJar: string | undefined): boolean {
  if (!cookieJar) return false;
  const pairs = cookieJar.split(";").map((s) => s.trim());
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key === CONSENT_COOKIE && value === "1") return true;
  }
  return false;
}

export function setConsentDismissed(): void {
  document.cookie = `${CONSENT_COOKIE}=1; max-age=31536000; path=/; sameSite=lax`;
}
