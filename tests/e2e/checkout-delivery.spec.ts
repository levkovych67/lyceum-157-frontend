import { test, expect } from "@playwright/test";

const CART_ITEM = {
  productId: "p-1",
  slug: "test-painting",
  title: "Тест Картина",
  priceUah: "200.00",
  qty: 1,
  thumbnailUrl: null,
  type: "PHYSICAL" as const,
};

const PRODUCT_DETAIL = {
  id: "p-1",
  slug: "test-painting",
  title: "Тест Картина",
  type: "PHYSICAL",
  priceUah: "200.00",
  stockQty: 999,
};

const CITIES_FIXTURE = [{ ref: "ref-kyiv", name: "Київ", area: "Київська обл." }];

const BRANCHES_FIXTURE = [
  {
    ref: "br-1",
    number: "5",
    type: "BRANCH",
    address: "вул. Сагайдачного, 25",
    maxWeightKg: 30,
    schedule: "Пн-Нд 9-21",
  },
  {
    ref: "br-2",
    number: "24001",
    type: "POSTBOX",
    address: "вул. Хрещатик, 1",
    maxWeightKg: 30,
    schedule: "24/7",
  },
];

test.describe("@smoke checkout delivery", () => {
  test("renders delivery section with city input", async ({ page }) => {
    await page.addInitScript((item) => {
      window.localStorage.setItem(
        "lyceum-cart-v1",
        JSON.stringify({ state: { items: [item], count: 1 }, version: 0 }),
      );
    }, CART_ITEM);

    await page.route("**/api/v1/products/test-painting**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(PRODUCT_DETAIL),
      }),
    );

    await page.route("**/api/v1/delivery/nova-poshta/cities*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(CITIES_FIXTURE),
      }),
    );

    await page.route("**/api/v1/delivery/nova-poshta/cities/*/branches", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(BRANCHES_FIXTURE),
      }),
    );

    await page.goto("/checkout");
    await expect(page.getByPlaceholder("Почніть вводити назву")).toBeVisible();
    await expect(page.getByText("Місто", { exact: true })).toBeVisible();
  });
});
