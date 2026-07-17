import {
  APIRequestContext,
  test as base,
  request as APIRequest,
  expect,
} from "@playwright/test";
import { env } from "node:process";

type Fixtures = {
  getToken: string;
};

export const test = base.extend<Fixtures>({
  getToken: async ({}, use) => {
    const request = await APIRequest.newContext();

    const response = await request.post("/api/users/login", {
      data: {
        user: {
          email: env.CONDUIT_EMAIL,
          password: env.CONDUIT_PASSWORD,
        },
      },
      failOnStatusCode: true,
    });
    const json = await response.json();
    const token = json["user"]["token"];
    await use(token);
  },
  request: async ({ getToken }, use) => {
    // Створюємо новий контекст реквесту
    const req = await APIRequest.newContext({
      extraHTTPHeaders: {
        Authorization: `Token ${getToken}`,
      },
    });
    // Повертаємо новий контекст з токеном в хедері - повністю заміняє
    await use(req);
  },
});
async function checkToken(request: APIRequestContext) {
  const response = await request.post("/api/users/login", {
    data: {
      user: {
        email: env.CONDUIT_EMAIL,
        password: env.CONDUIT_PASSWORD,
      },
    },
    failOnStatusCode: true,
  });
  const json = await response.json();
  const token = json["user"]["token"];
  return token;
}
