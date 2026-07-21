import { test, expect } from "../../fixtures/auth2.fixtures";
import { TAG } from "../../app/tags";
import { generateUniqueTitle } from "../../data/data-generator";
import { parseAndValidateResponse } from "../helpers/schema.helper";
import {
  ArticleResponseSchema,
  ArticlesResponseSchema,
  TagsResponseSchema,
  UserResponseSchema,
} from "../../conduit/schemas/article.schema";

test.describe(
  "Create/Get/Update article",
  {
    tag: [TAG.functional],
    annotation: {
      type: "issue",
      description: "MG-215",
    },
  },
  () => {
    test("Create article should be successful", async ({ authRequest }) => {
      // Arrange
      const payload =
        await test.step("Prepare data for a new article", async () => {
          return {
            article: {
              title: generateUniqueTitle(),
              description: generateUniqueTitle(),
              body: generateUniqueTitle(),
              tagList: ["test", "api"],
            },
          };
        });

      // Act
      const response =
        await test.step("Send request to create a new article", async () => {
          return await authRequest.post("/api/articles", {
            data: payload,
            failOnStatusCode: true,
          });
        });

      // Assert
      await test.step("Verify create article status code", async () => {
        expect(response.status()).toBe(200);
        expect(response).toBeOK();
      });

      await test.step("Verify create article response headers", async () => {
        const headers = response.headers();

        expect.soft(headers["content-type"]).toContain("application/json");
      });

      const validatedBody =
        await test.step("Parse and validate created article response", async () => {
          return await parseAndValidateResponse(
            response,
            ArticleResponseSchema,
          );
        });

      await test.step("Verify created article response body", async () => {
        const article = validatedBody.article;

        expect.soft(article.title).toBe(payload.article.title);
        expect.soft(article.description).toBe(payload.article.description);
        expect.soft(article.body).toBe(payload.article.body);
        expect.soft(article.tagList).toEqual(payload.article.tagList);

        expect.soft(article.slug).toEqual(expect.any(String));
        expect.soft(article.slug.length).toBeGreaterThan(0);

        expect.soft(article.author.username).toEqual(expect.any(String));
        expect.soft(article.author.username.length).toBeGreaterThan(0);

        expect.soft(article.favorited).toBe(false);
        expect.soft(article.favoritesCount).toBeGreaterThanOrEqual(0);
      });
    });

    test("Get articles should be successful", async ({ authRequest }) => {
      // Arrange
      const params =
        await test.step("Prepare article list query parameters", async () => {
          return {
            offset: 0,
            limit: 10,
          };
        });

      // Act
      const response =
        await test.step("Send request to get articles", async () => {
          return await authRequest.get("/api/articles", {
            params,
            failOnStatusCode: true,
          });
        });

      // Assert
      await test.step("Verify articles response status code", async () => {
        expect(response.status()).toBe(200);
        expect(response).toBeOK();
      });

      await test.step("Verify articles response headers", async () => {
        const headers = response.headers();

        expect.soft(headers["content-type"]).toContain("application/json");
      });

      const validatedBody =
        await test.step("Parse and validate articles response", async () => {
          return await parseAndValidateResponse(
            response,
            ArticlesResponseSchema,
          );
        });

      await test.step("Verify returned article", async () => {
        expect(validatedBody.articles.length).toBeGreaterThan(0);

        expect
          .soft(validatedBody.articles.length)
          .toBeLessThanOrEqual(params.limit);

        expect
          .soft(validatedBody.articlesCount)
          .toBeGreaterThanOrEqual(validatedBody.articles.length);

        for (const article of validatedBody.articles) {
          expect.soft(article.slug).toEqual(expect.any(String));
          expect.soft(article.slug.length).toBeGreaterThan(0);

          expect.soft(article.title).toEqual(expect.any(String));
          expect.soft(article.title.length).toBeGreaterThan(0);

          expect
            .soft(
              article.description === null ||
                typeof article.description === "string",
            )
            .toBe(true);

          expect
            .soft(article.body === null || typeof article.body === "string")
            .toBe(true);

          expect.soft(Array.isArray(article.tagList)).toBe(true);

          for (const tag of article.tagList) {
            expect.soft(tag).toEqual(expect.any(String));
          }

          expect.soft(article.author.username).toEqual(expect.any(String));

          expect.soft(article.author.username.length).toBeGreaterThan(0);

          expect.soft(article.favorited).toEqual(expect.any(Boolean));

          expect.soft(article.favoritesCount).toBeGreaterThanOrEqual(0);
        }
      });
    });

    test("Get tags should be successful", async ({ authRequest }) => {
      // Act
      const response =
        await test.step("Send request to get available tags", async () => {
          return await authRequest.get("/api/tags", {
            failOnStatusCode: true,
          });
        });

      // Assert
      await test.step("Verify response status code", async () => {
        expect(response.status()).toBe(200);
        expect(response).toBeOK();
      });

      await test.step("Verify response headers", async () => {
        const headers = response.headers();

        expect.soft(headers["content-type"]).toContain("application/json");
      });

      const validatedBody =
        await test.step("Parse and validate tags response", async () => {
          return await parseAndValidateResponse(response, TagsResponseSchema);
        });

      await test.step("Verify every returned tag", async () => {
        expect(validatedBody.tags.length).toBeGreaterThan(0);

        for (const tag of validatedBody.tags) {
          expect.soft(tag).toEqual(expect.any(String));
          expect.soft(tag.length).toBeGreaterThan(0);
        }
      });
    });

    test("Update settings should be successful", async ({
      authRequest,
      registeredUser,
    }) => {
      // Arrange
      const payload =
        await test.step("Prepare updated user settings", async () => {
          return {
            user: {
              email: registeredUser.email,
              bio: "Update user settings API test",
              image: "https://placehold.co/200x200",
            },
          };
        });

      // Act
      const response =
        await test.step("Send request to update user settings", async () => {
          return await authRequest.put("/api/user", {
            data: payload,
            failOnStatusCode: true,
          });
        });

      // Assert
      await test.step("Verify update settings status code", async () => {
        expect(response.status()).toBe(200);
        expect(response).toBeOK();
      });

      await test.step("Verify update settings response headers", async () => {
        const headers = response.headers();

        expect.soft(headers["content-type"]).toContain("application/json");
      });

      const validatedBody =
        await test.step("Parse and validate updated user response", async () => {
          return await parseAndValidateResponse(response, UserResponseSchema);
        });

      await test.step("Verify updated user response body", async () => {
        const user = validatedBody.user;

        expect.soft(user.email).toBe(payload.user.email);
        expect.soft(user.bio).toBe(payload.user.bio);
        expect.soft(user.image).toBe(payload.user.image);

        expect.soft(user.username).toEqual(expect.any(String));
        expect.soft(user.username.length).toBeGreaterThan(0);

        expect.soft(user.token).toEqual(expect.any(String));
        expect.soft(user.token.length).toBeGreaterThan(0);
      });
    });
  },
);
