import { test, expect, type Page } from "@playwright/test";

// Route protection is now client-side (role layouts): with no session the bootstrap
// refresh fails and the layout redirects to /login. Mock refresh -> 401 for determinism,
// and wait for the async client redirect instead of asserting the URL synchronously.
async function mockNoSession(page: Page) {
  await page.route("**/api/v1/auth/refresh", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/problem+json",
      body: JSON.stringify({
        type: "urn:l157:auth/refresh-expired",
        title: "Expired",
        status: 401,
        detail: "",
        instance: "/api/v1/auth/refresh",
        timestamp: new Date().toISOString(),
      }),
    }),
  );
}

test("@smoke /student without session redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  await mockNoSession(page);
  await page.goto("/student");
  await page.waitForURL(/\/login/);
  expect(page.url()).toContain("/login");
});

test("@smoke /admin without session redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  await mockNoSession(page);
  await page.goto("/admin");
  await page.waitForURL(/\/login/);
  expect(page.url()).toContain("/login");
});

test("@smoke /parent/kyc/x has noindex header", async ({ request }) => {
  const r = await request.get("/parent/kyc/anything");
  const robots = r.headers()["x-robots-tag"];
  expect(robots).toContain("noindex");
});
