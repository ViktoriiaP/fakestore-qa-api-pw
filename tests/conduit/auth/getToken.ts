import { test, expect, APIRequestContext } from "@playwright/test";

async function getToken(request: APIRequestContext, email: string) {
  let token: string;

  try {
    console.log("reading existing token");
    token = await promises.readFile(".token", { encoding: "utf-8" });

    console.log("checking existing token");
    const isValid = await isTokenValid(request, token);
    expect(isValid).toBeTruthy();
    console.log("existing token is valid");
  } catch (error) {
    console.log("getting new token");
    const response = await request.post("/api/users/login", {
      data: {
        user: {
          email: email,
          password: process.env.CONDUIT_PASSWORD,
        },
      },
      failOnStatusCode: true,
    });

    const json = await response.json();
    token = json["user"]["token"];

    console.log("saving new token to file .token");
    await promises.appendFile(".token", token);
    console.log("token saved");
  }

  return token;
}
