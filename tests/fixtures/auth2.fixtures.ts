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

type AuthFixtures = {
  registerUser: RegisterUser;
  registeredUser: RegisteredUser;
  authToken: string;
  authRequest: APIRequestContext;
};

export const test = base.extend<AuthFixtures>({
  registerUser: async ({}, use) => {
    const userData = {
      email: generateUniqueEmail(),
      username: generateUniqueUsername(),
      password: env.CONDUIT_PASSWORD,
    };
    await use(userData);
  },

  registeredUser: async ({ request, registerUser }, use) => {
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
  },

  authToken: async ({ registeredUser }, use) => {
    await use(registeredUser.token);
  },

  authRequest: async ({ playwright, authToken }, use) => {
    const baseURL = env.CONDUIT_BASE_URL;

    if (!baseURL) {
      throw new Error("CONDUIT_BASE_URL is not configured");
    }

    const authorizedRequest = await playwright.request.newContext({
      baseURL,
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
