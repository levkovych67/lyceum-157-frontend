import { test, expect } from "@playwright/test";

test("@smoke login submit empty focuses email and scrolls", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Увійти/ }).click();
  await expect(page.getByText(/Невірний email/)).toBeVisible();
  const focused = await page.evaluate(() =>
    (document.activeElement as HTMLElement)?.getAttribute("name"),
  );
  expect(focused).toBe("email");
});
