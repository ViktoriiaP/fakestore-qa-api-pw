import { test, expect } from "@playwright/test";
import { TAG } from "../../app/tags";
import { UsersSchema } from "../schemas/users-schema";

test.describe(
  "GET Users",
  {
    tag: [TAG.functional, TAG.user],
    annotation: {
      type: "issue",
      description: "MG-212",
    },
  },
  () => {
    test("get users - should be successful", async ({ request }) => {
      const response =
        await test.step("Send request to get all users", async () => {
          return await request.get("/api/v1/users", {
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

      await test.step("Verify that response contains users", async () => {
        expect.soft(Array.isArray(json)).toBeTruthy();
        expect.soft(json.length).toBeGreaterThan(0);
      });

      await test.step("Validate users response schema", async () => {
        const validationResult = UsersSchema.safeParse(json);

        expect(validationResult.success, {
          message: validationResult.error?.message,
        }).toBeTruthy();

        if (!validationResult.success) {
          console.log(validationResult.error.issues);
        }
      });

      await test.step("Verify the first user data", async () => {
        const firstUser = json[0];

        expect.soft(firstUser).toHaveProperty("id");
        expect.soft(firstUser).toHaveProperty("email");
        expect.soft(firstUser).toHaveProperty("password");
        expect.soft(firstUser).toHaveProperty("name");
        expect.soft(firstUser).toHaveProperty("role");
        expect.soft(firstUser).toHaveProperty("avatar");

        expect.soft(firstUser.id).toEqual(expect.any(Number));
        expect.soft(firstUser.email).toEqual(expect.any(String));
        expect.soft(firstUser.name).toEqual(expect.any(String));
        expect.soft(firstUser.role).toEqual(expect.any(String));
        expect.soft(firstUser.avatar).toEqual(expect.any(String));

        expect.soft(firstUser.email).toContain("@");
        expect.soft(firstUser.name.length).toBeGreaterThan(0);
      });
    });
  },
);
