import { test, expect } from "@playwright/test";
import { generateUniqueTitle } from "../../data/data-generator";
import { TAG } from "../../app/tags";
import { createProduct } from "./create-products";

//! create new product

test.describe(
  "Create new products",
  { tag: [TAG.functional, TAG.smoke, TAG.postProducts] },
  () => {
    test("create products - should be successful", async ({ request }) => {
      const { productId, payload } =
        await test.step("Create a new product", async () => {
          return await createProduct(request);
        });

      const jsonGet =
        await test.step("Get the created product by id", async () => {
          const response = await request.get(`/api/v1/products/${productId}`, {
            failOnStatusCode: true,
          });

          const headers = response.headers();
          expect.soft(Number(headers["content-length"])).toBeGreaterThan(100);

          return await response.json();
        });

      await test.step("Verify product data", async () => {
        expect(jsonGet).toHaveProperty("title", payload.title);
        expect(jsonGet).toHaveProperty("price", payload.price);
        expect(jsonGet).toHaveProperty("description", payload.description);
        expect(jsonGet).toHaveProperty("images", payload.images);
        expect(jsonGet).toHaveProperty("category.id", payload.categoryId);
      });
    });
  },
);

//! update created products
test.describe(
  "Update products",
  { tag: [TAG.functional, TAG.smoke, TAG.updateProducts] },
  () => {
    test("update products - should be successful", async ({ request }) => {
      const { productId } =
        await test.step("Create a new product ", async () => {
          return await createProduct(request, {
            price: 101,
          });
        });

      const updatedTitle = generateUniqueTitle();

      const responseUpdate = await test.step("Update the product", async () => {
        return await request.put(`/api/v1/products/${productId}`, {
          data: {
            title: updatedTitle,
            price: 109,
            description: "A description",
            categoryId: 1,
            images: ["https://placeimg.com/640/480/any"],
          },
        });
      });

      await test.step("Verify updated product", async () => {
        const jsonUpdate = await responseUpdate.json();

        expect.soft(responseUpdate.status()).toBe(200);
        expect.soft(jsonUpdate).toHaveProperty("title", updatedTitle);
        expect.soft(jsonUpdate).toHaveProperty("price", 109);
      });
    });
  },
);
