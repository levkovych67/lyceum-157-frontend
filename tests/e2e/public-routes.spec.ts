import { test, expect } from "@playwright/test";

const routes = ["/", "/catalog", "/about", "/contacts", "/collections", "/login", "/register"];

for (const path of routes) {
  test(`@smoke ${path} renders h1`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
  });
}
