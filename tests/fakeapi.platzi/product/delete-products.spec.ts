import { test, expect } from "@playwright/test";
import { generateUniqueTitle } from "../../data/data-generator";
import { TAG } from "../../app/tags";

//! delete created product

test.describe(
  "Delete product",
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

      const json = await response.json();
      const productId = json["id"];

      const responseDelete = await request.delete(
        `/api/v1/products/${productId}`,
      );

      expect(responseDelete.ok()).toBeTruthy();
      expect(await responseDelete.json()).toBe(true);
      void responseDelete;

      response = await request.get(`/api/v1/products/${productId}`);

      expect.soft(response.status()).toBe(400);
      const jsonG = await response.json();

      expect(jsonG.message).toContain("Could not find any entity");
    });
  },
);
