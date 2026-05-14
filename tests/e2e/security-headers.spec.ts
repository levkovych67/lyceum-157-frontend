import { expect, test } from "@playwright/test";

test("@smoke global security headers are present on home", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBeLessThan(400);
  const h = res.headers();
  expect(h["strict-transport-security"]).toContain("max-age=63072000");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  expect(h["content-security-policy-report-only"]).toBeDefined();
  expect(h["content-security-policy-report-only"]).toContain("default-src 'self'");
});

test("/parent path retains noindex header", async ({ request }) => {
  const res = await request.get("/parent/dashboard");
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
});
