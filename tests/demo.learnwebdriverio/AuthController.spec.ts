//https://conduit-api.learnwebdriverio.com/api/users
import { expect, test } from "@playwright/test";
import {generateUniqueUsername, generateUniqueEmail} from "../data/data-generator"

class AuthController extends TaskController {
test("users authorization - token should be valid", async ({ request }) => {
  
  const payload = {
    user: {
      email: generateUniqueEmail(),
      password: "T123456789",
      username: generateUniqueUsername(),
    },
  };
}