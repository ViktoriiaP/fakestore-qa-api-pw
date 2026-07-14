//https://conduit-api.learnwebdriverio.com/api/users
import { expect, test } from "@playwright/test";

class AuthController extends BaseControllers {
test("users authorization - token should be valid", async ({ request }) => {
  const randomize = Math.floor(Math.random() * 1_000);
  const payload = {
    user: {
      email: `vik${randomize}@gmail.com`,
      password: "T123456789",
      username: `vik${randomize}`,
    },
  };
}