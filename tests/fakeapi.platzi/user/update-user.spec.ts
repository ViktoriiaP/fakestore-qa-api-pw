import { test, expect } from "@playwright/test";
import { UserSchema } from "../schemas/users-schema";
import { CreateUserSchema } from "../schemas/createUser-schema";
import { UpdateUserSchema } from "../schemas/updateUser-schema";
import { generateUniqueEmail } from "../../data/data-generator";

test.describe("Update user", () => {
  test("update user - should be successful", async ({ request }) => {
    const createPayload = {
      name: "Viktoriia",
      email: generateUniqueEmail(),
      password: "1234",
      avatar: "https://picsum.photos/800",
    };

    const createdUser = await test.step("Create a user", async () => {
      const requestValidation = CreateUserSchema.safeParse(createPayload);
      console.log(requestValidation);

      expect(requestValidation.success, {
        message: requestValidation.error?.message,
      }).toBeTruthy();

      const response = await request.post("/api/v1/users/", {
        data: createPayload,
        failOnStatusCode: true,
      });

      expect.soft(response.status()).toBe(201);
      expect.soft(response).toBeOK();

      const json = await response.json();

      const responseValidation = UserSchema.safeParse(json);

      expect(responseValidation.success, {
        message: responseValidation.error?.message,
      }).toBeTruthy();

      return UserSchema.parse(json);
    });

    const updatePayload = {
      email: generateUniqueEmail(),
      name: "Changed name",
    };

    const updatedUser = await test.step("Update the user", async () => {
      const requestValidation = UpdateUserSchema.safeParse(updatePayload);

      console.log(requestValidation);
      expect(requestValidation.success, {
        message: requestValidation.error?.message,
      }).toBeTruthy();

      const response = await request.put(`/api/v1/users/${createdUser.id}`, {
        data: updatePayload,
        failOnStatusCode: true,
      });

      // Перевірка коду відповіді
      expect.soft(response.status()).toBe(200);
      expect.soft(response).toBeOK();

      // Перевірка headers
      const headers = response.headers();

      expect.soft(headers["content-type"]).toContain("application/json");

      const bodyText = await response.text();

      // Перевірка, що body не порожній
      expect.soft(bodyText.length).toBeGreaterThan(0);

      const json = JSON.parse(bodyText);

      // Перевірка Zod-схеми response
      const responseValidation = UserSchema.safeParse(json);

      expect(responseValidation.success, {
        message: responseValidation.error?.message,
      }).toBeTruthy();

      return UserSchema.parse(json);
    });

    await test.step("Verify updated response body", async () => {
      expect(updatedUser.id).toBe(createdUser.id);
      expect(updatedUser.email).toBe(updatePayload.email);
      expect(updatedUser.name).toBe(updatePayload.name);
      // Поля, які не оновлювали, мають залишитися
      expect(updatedUser.avatar).toBe(createdUser.avatar);
      expect(updatedUser.role).toBe(createdUser.role);
      expect(updatedUser.password).toBe(createdUser.password);
    });
  });
});
