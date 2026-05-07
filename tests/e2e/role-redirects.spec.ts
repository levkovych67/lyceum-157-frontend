import { test, expect } from "@playwright/test";

test("@smoke /student without cookie redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  const resp = await page.goto("/student");
  expect(page.url()).toContain("/login");
  expect(resp?.ok()).toBeTruthy();
});

test("@smoke /admin without cookie redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/admin");
  expect(page.url()).toContain("/login");
});

test("@smoke /parent/kyc/x has noindex header", async ({ request }) => {
  const r = await request.get("/parent/kyc/anything");
  const robots = r.headers()["x-robots-tag"];
  expect(robots).toContain("noindex");
});
