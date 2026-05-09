import { test, expect } from "@playwright/test";

const CART_ITEM = {
  productId: "p-1",
  slug: "test-product",
  title: "Тест",
  priceUah: "100.00",
  qty: 1,
  thumbnailUrl: null,
  type: "DIGITAL" as const,
};

const PRODUCT_DETAIL = {
  id: "p-1",
  slug: "test-product",
  title: "Тест",
  type: "DIGITAL",
  priceUah: "100.00",
  stockQty: 999,
};

test("checkout retries on idem-conflict and rotates Idempotency-Key", async ({ page }) => {
  await page.addInitScript((item) => {
    window.localStorage.setItem(
      "lyceum-cart-v1",
      JSON.stringify({ state: { items: [item], count: 1 }, version: 0 }),
    );
  }, CART_ITEM);

  await page.route("**/api/v1/products/test-product**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PRODUCT_DETAIL),
    }),
  );

  let conflict = true;
  const idemKeysSeen: string[] = [];
  await page.route("**/api/v1/orders", async (route) => {
    const idemKey = route.request().headerValue("Idempotency-Key");
    idemKeysSeen.push((await idemKey) ?? "");
    if (conflict) {
      conflict = false;
      await route.fulfill({
        status: 409,
        contentType: "application/problem+json",
        body: JSON.stringify({
          type: "urn:l157:order/idem-conflict",
          title: "Idempotency conflict",
          status: 409,
          detail: "body mismatch",
          instance: "/api/v1/orders",
          timestamp: new Date().toISOString(),
        }),
      });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        orderId: "o-1",
        orderNumber: "L157-001",
        totalAmount: "100.00",
        status: "PENDING_PAYMENT",
        paymentUrl: "/checkout/success?fake=1",
      }),
    });
  });

  await page.goto("/checkout");

  await page.getByLabel(/Імʼя та прізвище/).fill("Іван Тест");
  await page.getByLabel(/Email/).fill("test@example.com");
  await page.getByLabel(/Телефон/).fill("+380501234567");

  await page.getByRole("button", { name: /Сплатити/ }).click();

  await page.waitForURL(/checkout\/success/);

  expect(idemKeysSeen).toHaveLength(2);
  expect(idemKeysSeen[0]).toMatch(/^[0-9a-f-]{36}$/);
  expect(idemKeysSeen[1]).toMatch(/^[0-9a-f-]{36}$/);
  expect(idemKeysSeen[0]).not.toBe(idemKeysSeen[1]);
});
