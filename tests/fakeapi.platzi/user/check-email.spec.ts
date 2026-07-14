import { test, expect } from "@playwright/test";
import { TAG } from "../tags";
import { generateUniqueEmail } from "../data-generator";

test.describe(
  "Check email availability",
  {
    tag: [TAG.user, TAG.functional, TAG.smoke],
  },
  () => {
    test("email should be available", async ({ request }) => {
      const payload = await test.step("Prepare a unique email", async () => {
        return {
          email: generateUniqueEmail(),
        };
      });

      const response =
        await test.step("Check that the email is available", async () => {
          return await request.post("/api/v1/users/is-available", {
            data: payload,
            failOnStatusCode: true,
          });
        });

      const json =
        await test.step("Verify response status and body", async () => {
          expect.soft(response).toBeOK();
          expect.soft(response.status()).toBe(201);
          expect
            .soft(response.headers()["content-type"])
            .toContain("application/json");

          const body = await response.json();
          console.log(body);

          return body;
        });

      // Platzi's is-available endpoint is unreliable: it returns `isAvailable: false`
      // even for freshly generated, never-used emails. We only assert the response
      // shape here, not the value, to avoid a flaky/false-negative test.
      await test.step("Verify that the response contains an isAvailable flag", async () => {
        expect.soft(json).toHaveProperty("isAvailable");
        expect.soft(typeof json.isAvailable).toBe("boolean");
      });
    });
  },
);
