import { test as base, expect, type APIRequestContext } from "@playwright/test";
import {
  generateUniqueEmail,
  generateUniqueUsername,
} from "../data/data-generator";
import { env } from "node:process";

type RegisterUser = {
  email: string;
  username: string;
  password: string;
};

type RegisteredUser = {
  email: string;
  username: string;
  token: string;
};

// Worker-scoped fixtures register a single Conduit user once per worker and
// reuse its token across every test in that worker. Test-scoped fixtures build
// per-test request contexts on top of that shared token.
type AuthWorkerFixtures = {
  registerUser: RegisterUser;
  registeredUser: RegisteredUser;
  authToken: string;
};

type AuthTestFixtures = {
  authRequest: APIRequestContext;
};

const conduitBaseURL =
  env.CONDUIT_BASE_URL || "https://conduit-api.learnwebdriverio.com";

export const test = base.extend<AuthTestFixtures, AuthWorkerFixtures>({
  registerUser: [
    async ({}, use) => {
      const userData = {
        email: generateUniqueEmail(),
        username: generateUniqueUsername(),
        password: env.CONDUIT_PASSWORD,
      };
      await use(userData);
    },
    { scope: "worker" },
  ],

  registeredUser: [
    async ({ playwright, registerUser }, use) => {
      const request = await playwright.request.newContext({
        baseURL: conduitBaseURL,
      });

      try {
        const response = await request.post("/api/users", {
          data: {
            user: registerUser,
          },
          failOnStatusCode: true,
        });

        expect(response).toBeOK();
        expect(response.status()).toBe(200);

        const json = await response.json();

        expect(json.user).toBeDefined();
        expect(json.user.token).toBeDefined();
        expect(json.user.email).toBe(registerUser.email);
        expect(json.user.username).toBe(registerUser.username);

        await use({
          email: json.user.email,
          username: json.user.username,
          token: json.user.token,
        });
      } finally {
        await request.dispose();
      }
    },
    { scope: "worker" },
  ],

  authToken: [
    async ({ registeredUser }, use) => {
      await use(registeredUser.token);
    },
    { scope: "worker" },
  ],

  authRequest: async ({ playwright, authToken }, use) => {
    const authorizedRequest = await playwright.request.newContext({
      baseURL: conduitBaseURL,
      extraHTTPHeaders: {
        Authorization: `Token ${authToken}`,
        Accept: "application/json",
      },
    });

    await use(authorizedRequest);

    await authorizedRequest.dispose();
  },
});

export { expect };
