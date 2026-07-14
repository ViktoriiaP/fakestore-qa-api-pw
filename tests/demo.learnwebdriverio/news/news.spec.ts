import { test, expect } from "../fixtures/news.fixture";

test("Search news", async ({ newsRequest }) => {
  const response = await newsRequest.get("/everything", {
    params: {
      q: "Playwright",
      pageSize: 5,
    },
  });

  expect(response).toBeOK();
  expect(response.status()).toBe(200);

  const json = await response.json();

  expect(json.status).toBe("ok");
  expect(json.totalResults).toBeGreaterThan(0);
  expect(json.articles.length).toBeGreaterThan(0);
});
