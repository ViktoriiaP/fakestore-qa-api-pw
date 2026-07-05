import { test, expect } from "@playwright/test";
import { generateUniqueTitle } from "./data-generator";
import { createProduct } from "../fakeapi.platzi/create-products";

let productId: number;
let payload: any;

test.beforeEach(async ({ request }) => {
  const product = await createProduct(request);

  productId = product.productId;
  payload = product.payload;
});

test("Update product", async ({ request }) => {
  const response = await request.put(`/api/v1/products/${productId}`, {
    data: {
      title: generateUniqueTitle(),
      price: 109,
      description: "A description",
      categoryId: 1,
      images: ["https://placeimg.com/640/480/any"],
    },
  });

  expect(response.ok()).toBeTruthy();
});
test.afterEach(async ({ request }) => {
  await request.delete(`/api/v1/products/${productId}`);
});
