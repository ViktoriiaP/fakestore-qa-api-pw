import { type FullConfig, request as APIRequest } from "@playwright/test";
import { writeFile } from "node:fs/promises";

async function globalSetup(config: FullConfig): Promise<void> {
  console.log("Global setup started...");

  const conduitProject = config.projects.find(
    (project) => project.name === "conduit",
  );

  if (!conduitProject) {
    throw new Error('Could not find project "conduit" in playwright.config.ts');
  }

  const baseURL = conduitProject.use.baseURL;
  const email = process.env.CONDUIT_EMAIL;
  const password = process.env.CONDUIT_PASSWORD;

  if (typeof baseURL !== "string") {
    throw new Error("CONDUIT baseURL is not configured");
  }

  if (!email) {
    throw new Error("CONDUIT_EMAIL is not configured");
  }

  if (!password) {
    throw new Error("CONDUIT_PASSWORD is not configured");
  }

  const request = await APIRequest.newContext({
    baseURL,
  });

  try {
    await request.get("/api/articles", {
      params: {
        offset: 0,
        limit: 1,
      },
      failOnStatusCode: true,
    });

    console.log("Getting new token...");

    const response = await request.post("/api/users/login", {
      data: {
        user: {
          email,
          password,
        },
      },
      failOnStatusCode: true,
    });

    const json = await response.json();
    const token = json.user?.token;

    if (typeof token !== "string" || token.length === 0) {
      throw new Error("Token was not returned by login endpoint");
    }

    console.log("Saving new token to .token");

    await writeFile(".token", token, "utf-8");

    console.log("Token saved");
  } finally {
    await request.dispose();
  }

  console.log("Global setup finished...");
}

export default globalSetup;
