import { test, expect } from "@playwright/test";

test.describe("@smoke cookie banner", () => {
  test("appears on first visit and dismisses persistently", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");

    const banner = page.getByRole("region", { name: /cookie/i });
    await expect(banner).toBeVisible();

    await expect(banner.getByRole("link", { name: /конфіденційності/i })).toHaveAttribute(
      "href",
      "/privacy",
    );

    await banner.getByRole("button", { name: /закрити/i }).click();
    await expect(banner).toBeHidden();

    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === "consent_dismissed");
    expect(consentCookie?.value).toBe("1");

    await page.reload();
    await expect(page.getByRole("region", { name: /cookie/i })).toBeHidden();
  });
});
