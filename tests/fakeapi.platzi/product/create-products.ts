import { APIRequestContext, expect } from "@playwright/test";
import { generateUniqueTitle } from "../../data/data-generator";

export interface ProductData {
  title?: string;
  price?: number;
  description?: string;
  categoryId?: number;
  images?: string[];
}

export async function createProduct(
  request: APIRequestContext,
  product: ProductData = {},
) {
  const payload = {
    title: product.title ?? generateUniqueTitle(),
    price: product.price ?? 100,
    description: product.description ?? "A description",
    categoryId: product.categoryId ?? 1,
    images: product.images ?? ["https://placeimg.com/640/480/any"],
  };

  const response = await request.post("/api/v1/products", {
    data: payload,
    failOnStatusCode: true,
  });

  expect(response.ok()).toBeTruthy();

  const json = await response.json();

  return {
    response,
    productId: json.id,
    product: json,
    payload,
  };
}
