import { test as base, expect, APIRequestContext } from "@playwright/test";

type NewsFixtures = {
  newsRequest: APIRequestContext;
};

export const test = base.extend<NewsFixtures>({
  newsRequest: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: process.env.NEWS_BASE_URL,
      extraHTTPHeaders: {
        "X-Api-Key": process.env.NEWS_API_KEY!,
      },
    });

    await use(request);

    await request.dispose();
  },
});

export { expect };
