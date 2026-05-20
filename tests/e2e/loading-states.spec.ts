import { test, expect } from "@playwright/test";

// TODO: rewrite as a Vitest + RTL + MSW component test.
// page.route() intercepts only browser requests, but /catalog fetches products
// server-side (RSC) — the 1500ms delay never applies. Also loading.tsx renders
// <PaperSkeletonGrid>, not the "ДРУКУЄТЬСЯ" stamp this test looks for.
// Playwright cannot slow down an RSC server fetch.
test.fixme("@smoke catalog shows paper skeleton during fetch", async ({ page }) => {
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
