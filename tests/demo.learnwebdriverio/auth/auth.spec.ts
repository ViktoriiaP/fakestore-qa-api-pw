//https://conduit-api.learnwebdriverio.com/api/users
import { expect, test } from "@playwright/test";

test("users authorization - token should be valid", async ({ request }) => {
  const randomize = Math.floor(Math.random() * 1_000);
  const payload = {
    user: {
      email: `vik${randomize}@gmail.com`,
      password: "T123456789",
      username: `vik${randomize}`,
    },
  };

  console.log(payload);
  console.log(JSON.stringify(payload));

  const response = await request.post("/api/users", {
    data: payload,
    failOnStatusCode: false,
  });
  const rJson = await response.json();
  const token = rJson["user"]["token"];
  console.log(token);

  expect(token).toBeDefined();
  expect(response.status()).toBe(200);
  console.log(await response.text());
});

test("login user - token should be valid", async ({ request }) => {
  console.log(process.env.CONDUIT_EMAIL);
  console.log(process.env.CONDUIT_PASSWORD);

  const payload = {
    user: {
      email: process.env.CONDUIT_EMAIL,
      password: process.env.CONDUIT_PASSWORD,
    },
  };

  const response = await request.post("/api/users/login", {
    data: payload,
    failOnStatusCode: false,
  });
  const rJson = await response.json();

  console.log(rJson);

  expect(response.status()).toBe(200);
  expect(rJson.user).toBeDefined();
  const token = rJson.user.token;
  expect(token).toBeDefined();
});
