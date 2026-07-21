import {
  APIRequestContext,
  test as base,
  request as APIRequest,
  expect,
} from "@playwright/test";
import { promises } from "fs";
import { env } from "node:process";
import { faker } from "@faker-js/faker";

type Fixtures = {
  isAuthorized: boolean;
  nonAuthRequest: APIRequestContext;
  user: string;
  randomString: string;
};

export const test = base.extend<Fixtures>({
  isAuthorized: true,
  user: env.CONDUIT_EMAIL,
  request: async ({ request, isAuthorized, user }, use) => {
    if (isAuthorized === true) {
      // отримаємо токен
      const token = await getToken(request, user);

      // створюємо новий контекст реквесту
      const req = await APIRequest.newContext({
        extraHTTPHeaders: {
          Authorization: `Token ${token}`,
        },
      });

      // повертаємо новий контекст
      await use(req);
    } else {
      await use(request);
    }
  },
  nonAuthRequest: async ({ request }, use) => {
    await use(request);
  },
  randomString: async ({}, use) => {
    const random = Math.floor(Math.random() * 1_000_000);
    const title = faker.lorem.word({ length: 10 });

    await use(random + title);
  },
});

export { expect } from "@playwright/test";

async function isTokenValid(request: APIRequestContext, token: string) {
  if (!token) {
    return false;
  }

  // /api/user requires auth and returns 401 for a missing/invalid token,
  // unlike /api/articles which is public and returns 200 regardless.
  const response = await request.get("/api/user", {
    headers: {
      Authorization: `Token ${token}`,
    },
    failOnStatusCode: false,
  });

  return response.ok();
}

async function getToken(request: APIRequestContext, email: string) {
  let token: string;

  try {
    console.log("reading existing token");
    token = await promises.readFile(".token", { encoding: "utf-8" });

    console.log("checking existing token");
    const isValid = await isTokenValid(request, token);
    expect(isValid).toBeTruthy();
    console.log("existing token is valid");
  } catch (error) {
    console.log("getting new token");
    const response = await request.post("/api/users/login", {
      data: {
        user: {
          email: email,
          password: env.CONDUIT_PASSWORD,
        },
      },
      failOnStatusCode: true,
    });

    const json = await response.json();
    token = json["user"]["token"];

    console.log("saving new token to file .token");
    await promises.writeFile(".token", token);
    console.log("token saved");
  }

  return token;
}

// READER email: reader@gm.com password: 1234
// ADMIN email: admin@gm.com password: 1234
