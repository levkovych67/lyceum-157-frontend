import { test, expect } from "@playwright/test";

test("@smoke catalog widget boundary catches API failure and recovers", async ({ page }) => {
  let failOnce = true;

  await page.route("**/api/v1/products**", async (route) => {
    if (failOnce) {
      failOnce = false;
      await route.fulfill({ status: 500, body: "boom" });
    } else {
      await route.continue();
    }
  });

  await page.goto("/catalog");

  // Either WidgetErrorBoundary fallback (preferred) OR segment-level (public)/error.tsx kicks in.
  // At least one of these texts MUST be visible — the page must not be blank.
  const widgetFallback = page.getByText(/Не вдалось показати/i);
  const segmentFallback = page.getByText(/АРКУШ ЗІМ'ЯВСЯ/i);
  await expect(widgetFallback.or(segmentFallback).first()).toBeVisible({ timeout: 5000 });

  // Click reset (whichever fallback rendered)
  const resetBtn = page.getByRole("button", { name: /Друкувати знову|Перезавантажити/i }).first();
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    // Eventually skeleton or real content shows; at minimum the error fallback dismisses
    await expect(widgetFallback.or(segmentFallback).first()).toBeHidden({ timeout: 5000 });
  }
});
