import { type APIRequestContext, expect } from "@playwright/test";

type Category = {
  id: number;
  name: string;
};

export async function getExistingCategoryId(
  request: APIRequestContext,
): Promise<number> {
  const response = await request.get("/api/v1/categories", {
    failOnStatusCode: true,
  });

  expect(response).toBeOK();
  expect(response.status()).toBe(200);

  const categories = (await response.json()) as Category[];

  expect(Array.isArray(categories)).toBe(true);
  expect(categories.length).toBeGreaterThan(0);

  const categoryId = categories[0]?.id;

  if (typeof categoryId !== "number") {
    throw new Error("No valid category id was returned by the API");
  }

  return categoryId;
}
