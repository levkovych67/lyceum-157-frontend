import { test, expect } from "@playwright/test";

// Proves the F5 fix: a valid refresh_token cookie restores the session on page load,
// so reloading a protected page keeps the user in instead of bouncing to /login.
// The bootstrap refresh is mocked to succeed; we assert the URL stays on /account.
test("@smoke session survives a page reload", async ({ page }) => {
  await page.route("**/api/v1/auth/refresh", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "e2e-access-token",
        expiresIn: 900,
        userId: "11111111-1111-1111-1111-111111111111",
        role: "STUDENT",
        tokenType: "Bearer",
      }),
    }),
  );

  // Initial load: arm the response listener BEFORE navigating so it cannot be missed.
  const firstRefresh = page.waitForResponse("**/api/v1/auth/refresh");
  await page.goto("/account");
  await firstRefresh;
  await expect(page).toHaveURL(/\/account/);

  // Reload: the refresh_token cookie must restore the session again — no bounce to /login.
  const secondRefresh = page.waitForResponse("**/api/v1/auth/refresh");
  await page.reload();
  await secondRefresh;
  await expect(page).toHaveURL(/\/account/);
});
