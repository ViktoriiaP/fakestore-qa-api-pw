import { test, expect } from "../../fixtures/news.fixture";
import { TAG } from "../../app/tags";
import {
  everythingTestData,
  type EverythingTestData,
} from "../../data/news.data";
import {
  EverythingSuccessSchema,
  EverythingErrorSchema,
} from "../schemas/news.schema";

test.describe(
  "Search for news articles",
  {
    tag: [TAG.functional, TAG.regression],
  },
  () => {
    for (const testData of everythingTestData) {
      test(`Everything API: ${testData.testName}`, async ({ newsRequest }) => {
        // Arrange
        const params = await test.step("Prepare request parameters", async () =>
          testData.params);
        // Act
        const response =
          await test.step("Send GET /everything request", async () => {
            return await newsRequest.get("everything", {
              params,
              failOnStatusCode: testData.expectedStatus < 400,
            });
          });

        const responseBody = await test.step("Read response body", async () => {
          return await response.json();
        });
        // Assert
        await test.step("Verify status code and response headers", async () => {
          expect.soft(response.status()).toBe(testData.expectedStatus);

          if (testData.expectedStatus < 400) {
            expect.soft(response).toBeOK();
          } else {
            expect.soft(response.ok()).toBe(false);
          }

          expect
            .soft(response.headers()["content-type"])
            .toContain("application/json");
        });

        await test.step("Validate news response schema", async () => {
          if (testData.expectedApiStatus === "ok") {
            verifySuccessResponse(responseBody, testData);
          } else {
            verifyErrorResponse(responseBody, testData);
          }
        });
      });
    }
  },
);

function verifySuccessResponse(
  responseBody: unknown,
  testData: EverythingTestData,
): void {
  const validationResult = EverythingSuccessSchema.safeParse(responseBody);

  expect
    .soft(
      validationResult.success,
      validationResult.success
        ? undefined
        : JSON.stringify(validationResult.error.issues, null, 2),
    )
    .toBe(true);

  if (!validationResult.success) {
    return;
  }

  const data = validationResult.data;

  expect.soft(data.status).toBe("ok");

  expect.soft(data.totalResults).toBeGreaterThanOrEqual(0);

  expect
    .soft(data.articles.length)
    .toBeLessThanOrEqual(testData.params.pageSize ?? 100);

  if (testData.expectArticles) {
    expect.soft(data.articles.length).toBeGreaterThan(0);
  }

  if (data.articles.length === 0) {
    return;
  }

  const article = data.articles[0];

  expect.soft(article.url).toMatch(/^https?:\/\//);

  expect.soft(Number.isNaN(Date.parse(article.publishedAt))).toBe(false);

  expect.soft(article.source.name.length).toBeGreaterThan(0);

  if (article.author) {
    expect.soft(article.author.length).toBeGreaterThan(0);
  }

  if (article.description) {
    expect.soft(article.description.length).toBeGreaterThan(0);
  }

  if (article.content) {
    expect.soft(article.content.length).toBeGreaterThan(0);
  }
}

function verifyErrorResponse(
  responseBody: unknown,
  testData: EverythingTestData,
): void {
  const validationResult = EverythingErrorSchema.safeParse(responseBody);

  expect
    .soft(
      validationResult.success,
      validationResult.success
        ? undefined
        : JSON.stringify(validationResult.error.issues, null, 2),
    )
    .toBe(true);

  if (!validationResult.success) {
    return;
  }

  const data = validationResult.data;

  expect.soft(data.status).toBe("error");

  expect.soft(data.message.length).toBeGreaterThan(0);

  if (testData.expectedErrorCode) {
    expect.soft(data.code).toBe(testData.expectedErrorCode);
  }
}
