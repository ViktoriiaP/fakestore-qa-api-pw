import { test, expect } from "@playwright/test";
import { TAG } from "../tags";
import { CreateUserSchema } from "../schemas/createUser-schema";
import { UserSchema } from "../schemas/users-schema";
import { generateUniqueEmail } from "../data-generator";

test.describe(
  "Create user",
  {
    tag: [TAG.functional],
    annotation: {
      type: "issue",
      description: "MG-210",
    },
  },
  () => {
    test("create user - should be successful", async ({ request }) => {
      const payload =
        await test.step("Prepare data for a new user", async () => {
          return {
            name: "Viktoriia",
            email: generateUniqueEmail(),
            password: "1234",
            avatar: "https://picsum.photos/800",
          };
        });

      await test.step("Validate the user request schema", async () => {
        const validationResult = CreateUserSchema.safeParse(payload);

        expect(validationResult.success, {
          message: validationResult.error?.message,
        }).toBeTruthy();
      });

      const response =
        await test.step("Send a request to create the user", async () => {
          return await request.post("/api/v1/users", {
            data: payload,
            failOnStatusCode: true,
          });
        });

      const json =
        await test.step("Verify response status and headers", async () => {
          expect(response).toBeOK();
          expect(response.status()).toBe(201);

          const headers = response.headers();

          expect(headers["content-type"]).toContain("application/json");

          return await response.json();
        });

      await test.step("Validate the created user response schema", async () => {
        const validationResult = UserSchema.safeParse(json);

        expect(validationResult.success, {
          message: validationResult.error?.message,
        }).toBeTruthy();
      });

      await test.step("Verify the created user data", async () => {
        expect(json.id).toEqual(expect.any(Number));
        expect(json.name).toBe(payload.name);
        expect(json.email).toBe(payload.email);
        expect(json.avatar).toBe(payload.avatar);
        expect(json.role).toEqual(expect.any(String));
      });
    });
  },
);
