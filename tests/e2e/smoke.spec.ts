import { test, expect } from "@playwright/test";

test("@smoke home renders with title and paper noise", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Майстерня 157/);
  const opacity = await page.evaluate(() => {
    const styles = getComputedStyle(document.body, "::before");
    return styles.getPropertyValue("opacity");
  });
  expect(parseFloat(opacity)).toBeGreaterThan(0);
});
