//https://conduit-api.learnwebdriverio.com/api/users
import { TAG } from "../../app/tags";
import { test, expect } from "../../fixtures/auth.fixtures";

test.describe(
  "Get token for registered user",
  {
    tag: [TAG.functional],
    annotation: {
      type: "issue",
      description: "MG-210",
    },
  },
  () => {
    test("Registered user should have valid token", async ({
      registeredUser,
    }) => {
      expect(registeredUser.email).toBeDefined();
      expect(registeredUser.username).toBeDefined();
      expect(registeredUser.token).toBeDefined();
    });
    test("token should be valid", async ({ authToken }) => {
      expect(authToken).toBeDefined();
      expect(typeof authToken).toBe("string");
      expect(authToken.length).toBeGreaterThan(0);
    });
  },
);
