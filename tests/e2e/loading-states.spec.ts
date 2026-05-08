import { test, expect } from "@playwright/test";

test("@smoke catalog shows paper skeleton during fetch", async ({ page }) => {
  // Slow down the products fetch so we can observe loading.tsx
  await page.route("**/api/v1/products**", async (route) => {
    await new Promise((r) => setTimeout(r, 1500));
    await route.continue();
  });

  await page.goto("/catalog");

  // The "ДРУКУЄТЬСЯ" stamp is visible while loading.tsx is rendered
  await expect(page.getByText("ДРУКУЄТЬСЯ").first()).toBeVisible({ timeout: 1000 });

  // Eventually catalog content arrives (specific assertion depends on CatalogScreen — at minimum no skeleton)
  await expect(page.getByText("ДРУКУЄТЬСЯ").first()).toBeHidden({ timeout: 5000 });
});
