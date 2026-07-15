import { test, expect } from "../../fixtures/news.fixture";
import { TAG } from "../../app/tags";
import {
  everythingTestData,
  type EverythingTestData,
} from "../../data/news.data";

test.describe(
  "Search for news articles",
  {
    tag: [TAG.functional, TAG.regression],
  },
  () => {
    for (const testData of everythingTestData) {
      test(`Everything API: ${testData.testName}`, async ({ newsRequest }) => {
        // Arrange
        const params =
          await test.step(`Prepare search parameters for "${testData.testName}"`, async () => {
            return testData.params;
          });

        // Act
        const response =
          await test.step("Send request to search for news articles", async () => {
            return await newsRequest.get("everything", {
              params,
              failOnStatusCode: testData.expectedStatus < 400,
            });
          });

        const responseBody =
          await test.step("Read the news API response body", async () => {
            return await response.json();
          });

        // Assert
        await test.step("Verify response status code", async () => {
          expect.soft(response.status()).toBe(testData.expectedStatus);

          if (testData.expectedStatus < 400) {
            expect.soft(response).toBeOK();
          } else {
            expect.soft(response.ok()).toBe(false);
          }
        });

        await test.step("Verify response content type", async () => {
          const contentType = response.headers()["content-type"];

          expect.soft(contentType).toContain("application/json");
        });

        await test.step("Verify response body matches the expected scenario", async () => {
          expect.soft(responseBody.status).toBe(testData.expectedApiStatus);

          if (testData.expectedApiStatus === "ok") {
            verifySuccessfulResponse(responseBody, testData);
          } else {
            verifyErrorResponse(responseBody, testData);
          }
        });
      });
    }
  },
);

function verifySuccessfulResponse(
  responseBody: any,
  testData: EverythingTestData,
): void {
  expect.soft(responseBody).toHaveProperty("totalResults");
  expect.soft(responseBody).toHaveProperty("articles");

  expect.soft(responseBody.totalResults).toEqual(expect.any(Number));
  expect.soft(responseBody.totalResults).toBeGreaterThanOrEqual(0);

  expect.soft(Array.isArray(responseBody.articles)).toBe(true);

  const expectedPageSize = testData.params.pageSize ?? 100;

  expect
    .soft(responseBody.articles.length)
    .toBeLessThanOrEqual(expectedPageSize);

  if (testData.expectArticles) {
    expect.soft(responseBody.articles.length).toBeGreaterThan(0);
  }

  if (responseBody.articles.length === 0) {
    return;
  }

  const firstArticle = responseBody.articles[0];

  expect.soft(firstArticle).toHaveProperty("source");
  expect.soft(firstArticle).toHaveProperty("author");
  expect.soft(firstArticle).toHaveProperty("title");
  expect.soft(firstArticle).toHaveProperty("description");
  expect.soft(firstArticle).toHaveProperty("url");
  expect.soft(firstArticle).toHaveProperty("urlToImage");
  expect.soft(firstArticle).toHaveProperty("publishedAt");
  expect.soft(firstArticle).toHaveProperty("content");

  expect.soft(firstArticle.source).toEqual(expect.any(Object));
  expect.soft(firstArticle.title).toEqual(expect.any(String));
  expect.soft(firstArticle.url).toEqual(expect.any(String));
  expect.soft(firstArticle.publishedAt).toEqual(expect.any(String));

  expect.soft(firstArticle.source).toHaveProperty("id");
  expect.soft(firstArticle.source).toHaveProperty("name");

  expect.soft(firstArticle.source.name).toEqual(expect.any(String));

  expect.soft(firstArticle.url).toMatch(/^https?:\/\//);

  expect.soft(Number.isNaN(Date.parse(firstArticle.publishedAt))).toBe(false);
}

function verifyErrorResponse(
  responseBody: any,
  testData: EverythingTestData,
): void {
  expect.soft(responseBody).toHaveProperty("status", "error");
  expect.soft(responseBody).toHaveProperty("code");
  expect.soft(responseBody).toHaveProperty("message");

  expect.soft(responseBody.code).toEqual(expect.any(String));
  expect.soft(responseBody.message).toEqual(expect.any(String));
  expect.soft(responseBody.message.length).toBeGreaterThan(0);

  if (testData.expectedErrorCode) {
    expect.soft(responseBody.code).toBe(testData.expectedErrorCode);
  }
}
