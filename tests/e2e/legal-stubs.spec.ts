import { test, expect } from "@playwright/test";

test.describe("@smoke legal stub pages", () => {
  test("/privacy renders 200 with stub stamp", async ({ page }) => {
    const response = await page.goto("/privacy");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Політика конфіденційності/i })).toBeVisible();
    await expect(page.getByText("ДОКУМЕНТ ГОТУЄТЬСЯ")).toBeVisible();
  });

  test("/terms renders 200 with stub stamp", async ({ page }) => {
    const response = await page.goto("/terms");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Угода користувача/i })).toBeVisible();
    await expect(page.getByText("ДОКУМЕНТ ГОТУЄТЬСЯ")).toBeVisible();
  });

  test("cookie banner link navigates to /privacy", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");
    const link = page.getByRole("region", { name: /cookie/i }).getByRole("link", {
      name: /конфіденційності/i,
    });
    await link.click();
    await expect(page).toHaveURL(/\/privacy$/);
  });
});
