import { test, expect } from "@playwright/test";
import { TAG } from "../../app/tags";
import { UserSchema } from "../schemas/users-schema";

test.describe(
  "GET single user",
  {
    tag: [TAG.functional, TAG.user],
    annotation: {
      type: "issue",
      description: "MG-212",
    },
  },
  () => {
    test("get single user - should be successful", async ({ request }) => {
      const userId = 1;

      const response =
        await test.step("Send request to get user by id", async () => {
          return await request.get(`/api/v1/users/${userId}`, {
            failOnStatusCode: true,
          });
        });

      const json =
        await test.step("Verify response status, headers and body", async () => {
          expect.soft(response).toBeOK();
          expect.soft(response.status()).toBe(200);

          const headers = response.headers();

          expect.soft(headers["content-type"]).toContain("application/json");

          const bodyText = await response.text();

          expect.soft(bodyText.length).toBeGreaterThan(0);

          return JSON.parse(bodyText);
        });

      await test.step("Validate user's response schema", async () => {
        const validationResult = UserSchema.safeParse(json);
        expect(validationResult.success, {
          message: validationResult.error?.message,
        }).toBeTruthy();
      });

      await test.step("Verify returned user data", async () => {
        expect(json.id).toBe(userId);
        expect(json.email).toEqual(expect.any(String));
        expect(json.name).toEqual(expect.any(String));
        expect(json.role).toEqual(expect.any(String));
        expect(json.avatar).toEqual(expect.any(String));

        expect(json.email).toContain("@");
        expect(json.name.length).toBeGreaterThan(0);
      });
    });
  },
);
