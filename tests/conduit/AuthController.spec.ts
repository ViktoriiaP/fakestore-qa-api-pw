//https://conduit-api.learnwebdriverio.com/api/users
import { expect, test } from "@playwright/test";
import {generateUniqueUsername, generateUniqueEmail} from "../data/data-generator"

class AuthController extends BaseController {
test("users authorization - token should be valid", async ({ request }) => {
  
  const payload = {
    user: {
      email: generateUniqueEmail(),
      password: process.env.CONDUIT_PASSWORD,
      username: generateUniqueUsername(),
    },
  };
}