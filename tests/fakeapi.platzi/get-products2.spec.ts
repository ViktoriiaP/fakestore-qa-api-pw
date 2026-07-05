import { test, expect } from "@playwright/test";
import { generateUniqueTitle } from "./data-generator";
import { TAG } from "../fakeapi.platzi/tags";
import { createProduct } from "../fakeapi.platzi/create-products";

//! get product and check contain of the response

test.describe(
  "GET products",
  {
    tag: [TAG.getProducts, TAG.functional],
    annotation: { type: "issue", description: "MG-211" },
  },
  () => {
    // перевірка на рівні тесту - не запускати цей тест
    test.skip("get products - should be successful", async ({ request }) => {
      // перевірка всередині тесту - не запускати цей тест
      //test.skip(true, "API is temporarily unavailable");
      const response = await request.get("/api/v1/products", {
        failOnStatusCode: true,
      });
      expect(response).toBeOK();
      expect(response.status()).toBe(200);

      const json = (await response.json()) as any;

      expect(Array.isArray(json)).toBeTruthy();
      expect(json.length).toBeGreaterThan(0);

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

//! create new product

test.describe(
  "POST products",
  { tag: [TAG.functional, TAG.smoke, TAG.postProducts] },
  () => {
    test("create products - should be successful", async ({ request }) => {
      // запуск повільного тесту зі збільшеним таймаутом
      test.slow();
      const { productId, payload } = await createProduct(request);

      const responseGet = await request.get(`/api/v1/products/${productId}`, {
        failOnStatusCode: true,
      });

      const jsonGet = (await responseGet.json()) as any;

      expect(jsonGet).toHaveProperty("title", payload.title);
      expect(jsonGet).toHaveProperty("price", payload.price);
      expect(jsonGet).toHaveProperty("description", payload.description);
      expect(jsonGet).toHaveProperty("images", payload.images);
      expect(jsonGet).toHaveProperty("category.id", payload.categoryId);
    });
  },
);

//! update created products

//напр відомо про баг
test.describe(
  "UPD products",
  { tag: [TAG.functional, TAG.smoke, TAG.updateProducts] },
  () => {
    test.fixme("update products - should be successful", async ({
      request,
    }) => {
      const uniqueTitle = generateUniqueTitle();
      const response = await request.post("/api/v1/products", {
        data: {
          title: uniqueTitle,
          price: 101,
          description: "A description",
          categoryId: 1,
          images: ["https://placeimg.com/640/480/any"],
        },
        failOnStatusCode: true,
      });
      const json = (await response.json()) as any;
      const productId = json["id"];

      expect(productId).toBeTruthy();
      expect(typeof productId).toBe("number");

      const updatedTitle = generateUniqueTitle();
      const responseUpdate = await request.put(
        `/api/v1/products/${productId}`,
        {
          data: {
            title: updatedTitle,
            price: 109,
            description: "A description",
            categoryId: 1,
            images: ["https://placeimg.com/640/480/any"],
          },
        },
      );

      expect(responseUpdate).toBeTruthy();

      const jsonUpdate = (await responseUpdate.json()) as any;
      expect.soft(jsonUpdate).toHaveProperty("title", updatedTitle);
      expect.soft(jsonUpdate).toHaveProperty("price", 109);
      void responseUpdate;
    });
  },
);

//! delete created product
test.describe(
  "Delete products",
  { tag: [TAG.functional, TAG.smoke, TAG.deleteProducts] },
  () => {
    test("delete products - should be successful", async ({ request }) => {
      const uniqueTitle = generateUniqueTitle();
      let response = await request.post("/api/v1/products/", {
        data: {
          title: uniqueTitle,
          price: 10,
          description: "A description",
          categoryId: 1,
          images: ["https://placeimg.com/640/480/any"],
        },
        failOnStatusCode: true,
      });

      const json = (await response.json()) as any;
      const productId = json["id"];

      const responseDelete = await request.delete(
        `/api/v1/products/${productId}`,
      );

      expect(responseDelete.ok()).toBeTruthy();
      expect(await responseDelete.json()).toBe(true);
      void responseDelete;

      response = await request.get(`/api/v1/products/${productId}`);

      expect(response.status()).toBe(400);
    });
  },
);

//! filtered by categoryId

test.describe(
  "Filtering products",
  { tag: [TAG.functional, TAG.filteringProducts, TAG.smoke] },
  () => {
    test("filtering products by categoryId - should be successful", async ({
      request,
    }) => {
      const response = await request.get("/api/v1/products", {
        params: { categoryId: 1 },
      });
      let respGet;
      await expect(async () => {
        respGet = await request.get("/api/v1/products", {
          params: { categoryId: 1 },
          failOnStatusCode: false,
        });
        expect(respGet.status()).toBe(200);
      }).toPass({
        timeout: 15_000,
        intervals: [1000, 2_000, 10_000],
      });

      expect(response.ok()).toBeTruthy();
      const json = (await response.json()) as any;

      for (const product of json) {
        expect(product.category.id).toBe(1);
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
      const json = (await response.json()) as any;

      for (const product of json) {
        expect(product.price).toBe(10);
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
      const json = (await response.json()) as any;

      for (const product of json) {
        expect(product.price).toBeGreaterThanOrEqual(10);
        expect(product.price).toBeLessThanOrEqual(100);
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
      const json = (await response.json()) as any;

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
      const json = (await response.json()) as any;

      for (const product of json) {
        expect(product.price).toBeGreaterThanOrEqual(10);
        expect(product.price).toBeLessThanOrEqual(100);
        expect(product.category.id).toBe(1);
      }
    });

    // filtering products by limit

    test("filtering products by limit - should be successful", async ({
      request,
    }) => {
      //   await test.step('1.verify that products is filtering')
      const response = await request.get("/api/v1/products", {
        params: { offset: 0, limit: 5 },
      });

      expect(response.ok()).toBeTruthy();
      const json = (await response.json()) as any;
      expect(json.length).toBeLessThanOrEqual(5);
      //expect(json.length).toBe(5);
    });
  },
);
