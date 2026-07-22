import { type APIRequestContext, expect } from "@playwright/test";
import { generateUniqueTitle } from "../../data/data-generator";
import { getExistingCategoryId } from "../product/get-existing-category";

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
  const categoryId =
    product.categoryId ?? (await getExistingCategoryId(request));

  const payload = {
    title: product.title ?? generateUniqueTitle(),
    price: product.price ?? 100,
    description: product.description ?? generateUniqueTitle(),
    categoryId,
    images: product.images ?? ["https://placehold.co/600x400"],
  };

  const response = await request.post("/api/v1/products", {
    data: payload,
    failOnStatusCode: true,
  });

  expect(response).toBeOK();
  expect(response.status()).toBe(201);

  const json = await response.json();

  expect(json.id).toEqual(expect.any(Number));

  return {
    response,
    productId: json.id,
    product: json,
    payload,
  };
}
