import { test, expect } from "../../fixtures/api-fixtures";
import { ApiController } from "./controllers/ApiController";
import { env } from "node:process";

// Покриває функціонал створення статті (POST /api/articles),
// що використовується на сторінці "New Article" (https://demo.learnwebdriverio.com/editor)

test.describe("Conduit - Create Article (POST /api/articles)", () => {
  test("create article - should be created successfully", async ({
    articleController,
    randomString,
    request,
  }) => {
    const response = await articleController.createArticle({
      title: randomString,
      description: "desc here",
      body: "body here",
      tagList: ["qa", "test"],
    });

    const json = await response.json();
    const article = json["article"];

    expect(article["title"]).toBe(randomString);
    expect(article["description"]).toBe("desc here");
    expect(article["body"]).toBe("body here");
    expect(article["tagList"]).toEqual(["qa", "test"]);
    expect(article["slug"]).toBeDefined();
    expect(article["author"]["username"]).toBe(env.CONDUIT_USERNAME);
    expect(article["favorited"]).toBe(false);
    expect(article["favoritesCount"]).toBe(0);

    // перевіряємо, що статтю справді збережено
    const getResponse = await request.get(`/api/articles/${article["slug"]}`, {
      failOnStatusCode: true,
    });

    const getJson = await getResponse.json();
    expect(getJson["article"]["title"]).toBe(randomString);
  });

  test("create article - description and body are optional", async ({
    articleController,
    randomString,
  }) => {
    const response = await articleController.createArticle(
      {
        title: randomString,
        tagList: ["qa", "test"],
      },
      { failOnStatusCode: true },
    );

    const json = await response.json();
    expect(json["article"]["title"]).toBe(randomString);
    expect(json["article"]["tagList"]).toEqual(["qa", "test"]);
  });

  test("create article - duplicate titles should get unique slugs", async ({
    articleController,
    randomString,
  }) => {
    const payload = {
      title: randomString,
      description: "d",
      body: "b",
      tagList: [],
    };

    const response1 = await articleController.createArticle(payload, {
      failOnStatusCode: true,
    });

    const response2 = await articleController.createArticle(payload, {
      failOnStatusCode: true,
      isCleanup: true,
    });

    const slug1 = (await response1.json())["article"]["slug"];
    const slug2 = (await response2.json())["article"]["slug"];

    expect(slug1).not.toBe(slug2);
  });

  // Відомий баг API: замість 422 при відсутньому title сервер повертає 500
  test("create article - missing title currently causes a server error (known bug)", async ({
    articleController,
  }) => {
    const payload = {
      description: "d",
      body: "b",
      tagList: [],
    };

    const response = await articleController.createArticle(payload, {
      failOnStatusCode: false,
    });

    expect(response.status()).toBe(500);
  });
});

test.describe("unauthorized", () => {
  test.use({ isAuthorized: false });

  test("create article - without token should be unauthorized", async ({
    randomString,
    articleController,
  }) => {
    const response = await articleController.createArticle(
      {
        title: randomString,
        description: "desc here",
        body: "body here",
        tagList: ["qa", "test"],
      },
      { failOnStatusCode: false },
    );

    expect(response.status()).toBe(401);
  });
});

test("create article - should be created successfully", async ({
  randomString,
  request,
}) => {
  const api = new ApiController(request);

  const response = await api.articleController.createArticle({
    title: randomString,
    description: "desc here",
    body: "body here",
    tagList: ["qa", "test"],
  });

  const json = await response.json();
  const article = json["article"];

  expect(article["title"]).toBe(randomString);
  expect(article["description"]).toBe("desc here");
  expect(article["body"]).toBe("body here");
  expect(article["tagList"]).toEqual(["qa", "test"]);
  expect(article["slug"]).toBeDefined();
  expect(article["author"]["username"]).toBe(env.CONDUIT_USERNAME);
  expect(article["favorited"]).toBe(false);
  expect(article["favoritesCount"]).toBe(0);

  // перевіряємо, що статтю справді збережено
  const getResponse = await request.get(`/api/articles/${article["slug"]}`, {
    failOnStatusCode: true,
  });

  const getJson = await getResponse.json();
  expect(getJson["article"]["title"]).toBe(randomString);
});
