import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CookieBanner } from "@/widgets/cookie-banner";
import { CONSENT_COOKIE } from "@/shared/lib/consent/consent";

function setCookie(value: string) {
  Object.defineProperty(document, "cookie", {
    value,
    writable: true,
    configurable: true,
  });
}

describe("CookieBanner", () => {
  beforeEach(() => setCookie(""));

  it("renders banner when no consent cookie", () => {
    setCookie("");
    render(<CookieBanner />);
    expect(screen.queryByRole("region", { name: /cookie/i })).toBeInTheDocument();
  });

  it("does not render when consent_dismissed=1 cookie present", async () => {
    setCookie(`${CONSENT_COOKIE}=1`);
    render(<CookieBanner />);
    await waitFor(() => {
      expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
    });
  });

  it("renders notice + policy link + dismiss button when no cookie", () => {
    setCookie("");
    render(<CookieBanner />);
    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /конфіденційності/i });
    expect(link).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("button", { name: /закрити/i })).toBeInTheDocument();
  });

  it("dismiss click hides banner and writes cookie", async () => {
    let stored = "";
    Object.defineProperty(document, "cookie", {
      get: () => stored,
      set: (v: string) => {
        stored = v.split(";")[0] ?? "";
      },
      configurable: true,
    });
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: /закрити/i }));
    await waitFor(() => {
      expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
    });
    expect(stored).toContain(`${CONSENT_COOKIE}=1`);
  });
});
