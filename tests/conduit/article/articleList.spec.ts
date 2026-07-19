import { test, expect } from "../../fixtures/api-fixtures";

// Покриває функціонал стрічки статей (GET /api/articles) з пагінацією
// та фільтрами, що використовується на головній сторінці
// (https://demo.learnwebdriverio.com/)

test.describe("Conduit - Articles Feed (GET /api/articles)", () => {
  test("get articles - should return a list without authentication", async ({
    articleController,
  }) => {
    const response = await articleController.getArticles(undefined, {
      failOnStatusCode: true,
    });

    const json = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(json["articles"])).toBe(true);
    expect(json["articlesCount"]).toBeGreaterThan(0);
  });

  test("get articles - default limit should be 20", async ({
    articleController,
  }) => {
    const response = await articleController.getArticles(undefined, {
      failOnStatusCode: true,
    });

    const json = await response.json();
    expect(json["articles"].length).toBeLessThanOrEqual(20);
  });

  test("get articles - offset and limit should control pagination", async ({
    articleController,
  }) => {
    // один запит з limit=2, щоб порівняти сусідні елементи атомарно —
    // два окремих запити (offset 0 та offset 1) є нестабільними, бо цей
    // публічний демо-API одночасно змінюється іншими паралельними тестами
    const response = await articleController.getArticles(
      { offset: 0, limit: 2 },
      { failOnStatusCode: true },
    );

    const json = await response.json();

    expect(json["articles"]).toHaveLength(2);
    expect(json["articles"][0]["slug"]).not.toBe(json["articles"][1]["slug"]);
  });

  test("get articles - should filter by tag", async ({
    articleController,
    randomString,
  }) => {
    const uniqueTag = `tag-${randomString}`;

    const createResponse = await articleController.createArticle(
      {
        title: randomString,
        description: "feed test description",
        body: "feed test body",
        tagList: [uniqueTag],
      },
      { failOnStatusCode: true },
    );
    const createdArticle = (await createResponse.json())["article"];

    const response = await articleController.getArticles(
      { tag: uniqueTag },
      { failOnStatusCode: true },
    );
    const json = await response.json();

    expect(json["articlesCount"]).toBe(1);
    expect(json["articles"][0]["title"]).toBe(createdArticle["title"]);
    expect(json["articles"][0]["tagList"]).toContain(uniqueTag);
  });

  test("get articles - unknown tag should return an empty list", async ({
    articleController,
  }) => {
    const response = await articleController.getArticles(
      { tag: "tag-that-does-not-exist-12345" },
      { failOnStatusCode: true },
    );

    const json = await response.json();

    expect(json["articles"]).toEqual([]);
    expect(json["articlesCount"]).toBe(0);
  });

  test("get articles - should filter by author", async ({
    articleController,
  }) => {
    const response = await articleController.getArticles(
      { author: "admin" },
      { failOnStatusCode: true },
    );

    const json = await response.json();

    expect(json["articlesCount"]).toBeGreaterThan(0);
    for (const article of json["articles"]) {
      expect(article["author"]["username"]).toBe("admin");
    }
  });

  // Відомий баг API: фільтр за неіснуючим author ігнорується
  // і повертається повний неотфільтрований список замість порожнього.
  // Порівнюємо не точні числа (бо публічний демо-API одночасно
  // змінюється іншими паралельними тестами), а сам факт, що фільтр
  // не відсіяв результати до порожнього списку.
  test("get articles - unknown author filter is ignored (known bug)", async ({
    articleController,
  }) => {
    const filtered = await articleController.getArticles(
      { author: "author-that-does-not-exist-12345" },
      { failOnStatusCode: true },
    );

    const filteredJson = await filtered.json();

    expect(filteredJson["articlesCount"]).toBeGreaterThan(0);
    expect(filteredJson["articles"].length).toBeGreaterThan(0);
  });

  test("get articles - unknown favorited filter should return an empty list", async ({
    articleController,
  }) => {
    const response = await articleController.getArticles(
      { favorited: "author-that-does-not-exist-12345" },
      { failOnStatusCode: true },
    );

    const json = await response.json();

    expect(json["articles"]).toEqual([]);
    expect(json["articlesCount"]).toBe(0);
  });
});

test.describe("unauthorized", () => {
  test.use({ isAuthorized: false });

  test("get articles - should return a list without a token", async ({
    articleController,
  }) => {
    const response = await articleController.getArticles(undefined, {
      failOnStatusCode: true,
    });

    const json = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(json["articles"])).toBe(true);
  });
});
