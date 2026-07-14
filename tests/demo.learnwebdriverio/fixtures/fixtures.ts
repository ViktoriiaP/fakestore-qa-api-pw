import { test as base, expect } from "@playwright/test";
import {
  generateUniqueEmail,
  generateUniqueUsername,
} from "../fakeapi.platzi/data-generator";

type RegisterUser = {
  email: string;
  username: string;
  password: string;
};

type AuthFixtures = {
  registerUser: RegisterUser;
  authToken: string;
};

export const test = base.extend<AuthFixtures>({
  registerUser: async ({}, use) => {
    const data = {
      email: generateUniqueEmail(),
      username: generateUniqueUsername(),
      password: "T123456789",
    };
    await use(data);
  },

  authToken: async ({ request, registerUser }, use) => {
    const response = await request.post("/api/users", {
      data: {
        user: registerUser,
      },
      failOnStatusCode: true,
    });

    expect(response.status()).toBe(201);

    const json = await response.json();

    await use(json.user.token);
  },
});

export { expect };
