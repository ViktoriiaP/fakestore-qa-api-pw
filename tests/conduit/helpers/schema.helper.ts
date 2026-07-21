import { expect, type APIResponse } from "@playwright/test";
import { z } from "zod";

// Reads API response body, validates it against a Zod schema
// and returns typed validated data

export async function parseAndValidateResponse<T>(
  response: APIResponse,
  schema: z.ZodType<T>,
): Promise<T> {
  const json = await response.json();

  const result = schema.safeParse(json);

  expect(result.success, {
    message: result.error?.message,
  }).toBeTruthy();

  if (!result.success) {
    throw new Error(
      `Response schema validation failed:\n${result.error.message}`,
    );
  }

  return result.data;
}
