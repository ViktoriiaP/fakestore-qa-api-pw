import { test as base, expect } from "@playwright/test";
import { generateUniqueEmail, generateUniqueUsername } from "../data-generator";

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
};

export const test = base.extend<AuthFixtures>({
  registerUser: async ({}, use) => {
    const userData = {
      email: generateUniqueEmail(),
      username: generateUniqueUsername(),
      password: "T123456789",
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
    expect(response.status()).toBe(201);

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
});
export { expect };
