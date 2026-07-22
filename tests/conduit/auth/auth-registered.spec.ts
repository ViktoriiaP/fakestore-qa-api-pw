import { TAG } from "../../app/tags";
import { test, expect } from "../../fixtures/auth2.fixtures";

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
      await test.step("Verify registered user data", async () => {
        expect.soft(registeredUser.email).toEqual(expect.any(String));
        expect.soft(registeredUser.username).toEqual(expect.any(String));
        expect.soft(registeredUser.token).toEqual(expect.any(String));

        expect.soft(registeredUser.email).toContain("@");
        expect.soft(registeredUser.username.length).toBeGreaterThan(0);
        expect.soft(registeredUser.token.length).toBeGreaterThan(0);
      });
    });

    test("Token should authorize API requests", async ({ authRequest }) => {
      const response =
        await test.step("Request the current authorized user", async () => {
          return await authRequest.get("/api/user", {
            failOnStatusCode: true,
          });
        });

      await test.step("Verify authorization is successful", async () => {
        expect.soft(response.status()).toBe(200);

        expect
          .soft(response.headers()["content-type"])
          .toContain("application/json");
      });

      const json =
        await test.step("Read the authorized user response", async () => {
          return await response.json();
        });

      await test.step("Verify current user data", async () => {
        expect.soft(json.user).toBeDefined();
        expect.soft(json.user.token).toEqual(expect.any(String));
        expect.soft(json.user.email).toEqual(expect.any(String));
        expect.soft(json.user.username).toEqual(expect.any(String));
      });
    });
  },
);
