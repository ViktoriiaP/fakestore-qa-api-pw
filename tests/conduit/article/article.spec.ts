import { test, expect } from "../../fixtures/auth2.fixtures";
import { TAG } from "../../app/tags";
import { generateUniqueTitle } from "../../data/data-generator";
import {
  ArticleResponseSchema,
  ArticlesResponseSchema,
  TagsResponseSchema,
  UserResponseSchema,
} from "../../app/conduit/schemas/article.schema";

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
              tagList: ["playwright", "api"],
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

      const json: unknown =
        await test.step("Read created article response", async () => {
          return await response.json();
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
        await test.step("Validate created article JSON schema", async () => {
          const result = ArticleResponseSchema.safeParse(json);

          expect(result.success, {
            message: result.error?.message,
          }).toBeTruthy();

          return result.success ? result.data : undefined;
        });

      await test.step("Verify created article response body", async () => {
        expect(validatedBody).toBeDefined();

        if (!validatedBody) {
          return;
        }

        const article = validatedBody.article;

        expect.soft(article.title).toBe(payload.article.title);
        expect.soft(article.description).toBe(payload.article.description);
        expect.soft(article.body).toBe(payload.article.body);
        expect.soft(article.tagList).toEqual(payload.article.tagList);
        expect.soft(article.slug).toEqual(expect.any(String));
        expect.soft(article.author.username).toEqual(expect.any(String));
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

      const json: unknown =
        await test.step("Read articles response", async () => {
          return await response.json();
        });

      // Assert
      await test.step("Verify articles status code", async () => {
        expect(response.status()).toBe(200);
        expect(response).toBeOK();
      });

      await test.step("Verify articles response headers", async () => {
        expect
          .soft(response.headers()["content-type"])
          .toContain("application/json");
      });

      const validatedBody =
        await test.step("Validate articles JSON schema", async () => {
          const result = ArticlesResponseSchema.safeParse(json);

          expect(result.success, {
            message: result.error?.message,
          }).toBeTruthy();

          return result.success ? result.data : undefined;
        });

      await test.step("Verify every article in response body", async () => {
        expect(validatedBody).toBeDefined();

        if (!validatedBody) {
          return;
        }

        expect(validatedBody.articles.length).toBeGreaterThan(0);

        expect
          .soft(validatedBody.articles.length)
          .toBeLessThanOrEqual(params.limit);

        expect
          .soft(validatedBody.articlesCount)
          .toBeGreaterThanOrEqual(validatedBody.articles.length);

        for (const article of validatedBody.articles) {
          expect.soft(article.slug).toEqual(expect.any(String));
          expect.soft(article.title).toEqual(expect.any(String));
          expect
            .soft(
              article.description == null ||
                typeof article.description === "string",
            )
            .toBe(true);
          expect
            .soft(article.body == null || typeof article.body === "string")
            .toBe(true);
          expect.soft(Array.isArray(article.tagList)).toBe(true);
          expect.soft(article.author.username).toEqual(expect.any(String));
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

      const json: unknown = await test.step("Read tags response", async () => {
        return await response.json();
      });

      // Assert
      await test.step("Verify tags status code", async () => {
        expect(response.status()).toBe(200);
        expect(response).toBeOK();
      });

      await test.step("Verify tags response headers", async () => {
        expect
          .soft(response.headers()["content-type"])
          .toContain("application/json");
      });

      const validatedBody =
        await test.step("Validate tags JSON schema", async () => {
          const result = TagsResponseSchema.safeParse(json);

          expect(result.success, {
            message: result.error?.message,
          }).toBeTruthy();

          return result.success ? result.data : undefined;
        });

      await test.step("Verify every returned tag", async () => {
        expect(validatedBody).toBeDefined();

        if (!validatedBody) {
          return;
        }

        expect(validatedBody.tags.length).toBeGreaterThan(0);

        for (const tag of validatedBody.tags) {
          expect.soft(tag).toEqual(expect.any(String));
          expect.soft(tag.length).toBeGreaterThan(0);
        }
      });
    });

    test("Update settings should be successful", async ({
      authRequest,
      registerUser,
    }) => {
      // Arrange
      const payload =
        await test.step("Prepare updated user settings", async () => {
          return {
            user: {
              email: registerUser.email,
              bio: "Hello from Playwright API test",
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

      const json: unknown =
        await test.step("Read updated user response", async () => {
          return await response.json();
        });

      // Assert
      await test.step("Verify update settings status code", async () => {
        expect(response.status()).toBe(200);
        expect(response).toBeOK();
      });

      await test.step("Verify update settings response headers", async () => {
        expect
          .soft(response.headers()["content-type"])
          .toContain("application/json");
      });

      const validatedBody =
        await test.step("Validate updated user JSON schema", async () => {
          const result = UserResponseSchema.safeParse(json);

          expect(result.success, {
            message: result.error?.message,
          }).toBeTruthy();

          return result.success ? result.data : undefined;
        });

      await test.step("Verify updated user response body", async () => {
        expect(validatedBody).toBeDefined();

        if (!validatedBody) {
          return;
        }

        expect.soft(validatedBody.user.email).toBe(payload.user.email);
        expect.soft(validatedBody.user.bio).toBe(payload.user.bio);
        expect.soft(validatedBody.user.image).toBe(payload.user.image);
        expect.soft(validatedBody.user.username).toEqual(expect.any(String));
        expect.soft(validatedBody.user.token.length).toBeGreaterThan(0);
      });
    });
  },
);
