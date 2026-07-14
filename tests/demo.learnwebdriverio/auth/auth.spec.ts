//https://conduit-api.learnwebdriverio.com/api/users
import { TAG } from "../../fakeapi.platzi/tags";
import { test as base, expect } from "../fixtures/auth.fixture";

test.describe(
  "Auth for user",
  {
    tag: [TAG.functional],
    annotation: {
      type: "issue",
      description: "MG-210",
    },
  },
  () => {
    test("User registration", async ({ authToken }) => {
      expect(authToken).toBeDefined();
    });

    test("User's authorization - token should be valid", async ({
      request,
    }) => {
      const payload = {
        user: {
          email: generateUniqueEmail,
          password: "T123456789",
          username: `vik+generateUniqueTitle`,
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
  },
);
