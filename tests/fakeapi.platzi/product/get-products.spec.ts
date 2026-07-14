import { test, expect } from "@playwright/test";
import { TAG } from "../tags";
import { Products } from "../schemas/products-schema";

// get product and check contain of the response

test.describe(
  "GET products",
  {
    tag: [TAG.getProducts, TAG.functional],
    annotation: { type: "issue", description: "MG-211" },
  },
  () => {
    test("get products - should be successful", async ({ request }) => {
      const response = await request.get("/api/v1/products", {
        failOnStatusCode: true,
      });

      expect.soft(response).toBeOK();
      expect.soft(response.status()).toBe(200);
      const headers = await response.headers();

      console.log(headers);

      expect
        .soft(headers["content-type"])
        .toBe("application/json; charset=utf-8");
      expect.soft(headers["server"]).toBe("Heroku");
      expect.soft(headers["content-security-policy"]).toContain("base-uri");

      const json = await response.json();

      expect.soft(Array.isArray(json)).toBeTruthy();
      expect.soft(json.length).toBeGreaterThan(0);

      const data = Products.safeParse(json);
      expect(data.success, { message: data.error?.message }).toBeTruthy();

      const product = json[0];

      expect.soft(product).toHaveProperty("id");
      expect.soft(product).toHaveProperty("title");
      expect.soft(product).toHaveProperty("slug");
      expect.soft(product).toHaveProperty("price");
      expect.soft(product).toHaveProperty("description");
      expect.soft(product).toHaveProperty("category");
      expect.soft(product).toHaveProperty("images");
    });
  },
);
// filtered by categoryId

test.describe(
  "GET filtered products",
  {
    tag: [TAG.filteringProducts, TAG.smoke, TAG.regression],
    annotation: { type: "issue", description: "MG-211" },
  },
  () => {
    test("filtering products by categoryId - should be successful", async ({
      request,
    }) => {
      const response = await request.get("/api/v1/products", {
        params: { categoryId: 1 },
      });

      expect(response.ok()).toBeTruthy();
      const json = await response.json();

      for (const product of json) {
        expect.soft(product.category.id).toBe(1);
      }
    });

    // filtering by price

    test("filtering products by price - should be successful", async ({
      request,
    }) => {
      const response = await request.get("/api/v1/products", {
        params: { price: 10 },
      });

      expect(response.ok()).toBeTruthy();
      const json = await response.json();

      for (const product of json) {
        expect.soft(product.price).toBe(10);
      }
    });

    // filtering by price between

    test("filtering products between min and max price - should be successful", async ({
      request,
    }) => {
      const response = await request.get("/api/v1/products", {
        params: { price_min: 10, price_max: 100 },
      });

      expect(response.ok()).toBeTruthy();
      const json = await response.json();

      for (const product of json) {
        expect.soft(product.price).toBeGreaterThanOrEqual(10);
        expect.soft(product.price).toBeLessThanOrEqual(100);
      }
    });

    // filtering by price and category

    test("filtering products by price and category - should be successful", async ({
      request,
    }) => {
      const response = await request.get("/api/v1/products", {
        params: { price: 10, categoryId: 1 },
      });

      expect(response.ok()).toBeTruthy();
      const json = await response.json();

      for (const product of json) {
        expect(product.price).toBe(10);
        expect(product.category.id).toBe(1);
      }
    });

    // filtering by category and min_max price

    test("filtering products by category and min_max price - should be successful", async ({
      request,
    }) => {
      const response = await request.get("/api/v1/products", {
        params: { price_min: 10, price_max: 100, categoryId: 1 },
      });

      expect(response.ok()).toBeTruthy();
      const json = await response.json();

      for (const product of json) {
        expect.soft(product.price).toBeGreaterThanOrEqual(10);
        expect.soft(product.price).toBeLessThanOrEqual(100);
        expect.soft(product.category.id).toBe(1);
      }
    });

    // filtering products by limit

    test("filtering products by limit - should be successful", async ({
      request,
    }) => {
      const response = await request.get("/api/v1/products", {
        params: { offset: 0, limit: 5 },
      });

      expect(response.ok()).toBeTruthy();
      const json = await response.json();
      expect.soft(json.length).toBeLessThanOrEqual(5);
      //expect(json.length).toBe(5);
    });
  },
);
