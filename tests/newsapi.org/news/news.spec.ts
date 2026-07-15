import { test, expect } from "../../fixtures/news.fixture";
import { faker } from "@faker-js/faker";
import { TAG } from "../../app/tags";

test.describe(
  "Search for news articles",
  {
    tag: [TAG.functional, TAG.smoke],
  },
  () => {
    test("Search news by keyword", async ({ newsRequest }) => {
      // Arrange
      const searchParams =
        await test.step("Prepare news search parameters", async () => {
          const from = new Date();
          from.setDate(from.getDate() - 7);

          return {
            q: "Apple",
            from: from.toISOString().split("T")[0],
            sortBy: "popularity",
          };
        });

      // Act
      const response =
        await test.step("Search for news articles by keyword", async () => {
          return await newsRequest.get("everything", {
            params: searchParams,
            failOnStatusCode: true,
          });
        });
      const responseBody =
        await test.step("Read the news search response", async () => {
          return await response.json();
        });

      // Assert
      await test.step("Verify response status and headers", async () => {
        expect.soft(response).toBeOK();
        expect.soft(response.status()).toBe(200);

        expect
          .soft(response.headers()["content-type"])
          .toContain("application/json");
      });

      await test.step("Verify news search response body", async () => {
        expect.soft(responseBody.status).toBe("ok");
        expect.soft(responseBody.totalResults).toBeGreaterThan(0);

        expect.soft(Array.isArray(responseBody.articles)).toBe(true);
        expect.soft(responseBody.articles.length).toBeGreaterThan(0);
        expect.soft(responseBody.articles.length).toBeLessThanOrEqual(100);
      });

      await test.step("Verify the first returned article", async () => {
        const firstArticle = responseBody.articles[0];

        expect.soft(firstArticle).toHaveProperty("source");
        expect.soft(firstArticle).toHaveProperty("title");
        expect.soft(firstArticle).toHaveProperty("url");
        expect.soft(firstArticle).toHaveProperty("publishedAt");

        expect.soft(firstArticle.title).toEqual(expect.any(String));
        expect.soft(firstArticle.url).toEqual(expect.any(String));
      });
    });
  },
);
