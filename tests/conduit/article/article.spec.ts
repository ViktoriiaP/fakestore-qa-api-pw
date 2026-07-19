import { test } from "../../fixtures/getToken.fixtures.ts";
import { TAG } from "../../app/tags";
import { generateUniqueTitle } from "../../data/data-generator";
import { title } from "process";

test.describe(
  "Create/Get/Update article",
  {
    tag: [TAG.functional],
    annotation: {
      type: "issue",
      description: "MG-215",
    },
  },
  () => {
    test("Create article should be successful", async ({ request }) => {
      //Act
      await request.post("/api/articles", {
        headers: {
          //    authorization: `Token ${token}`,
        },
        data: {
          article: {
            title: generateUniqueTitle(),
            description: generateUniqueTitle(),
            body: generateUniqueTitle(),
            tagList: [],
          },
        },
        failOnStatusCode: true,
      });
    });

    test("Get article should be successful", async ({ request }) => {
      //Act
      const response = await request.get("/api/articles", {
        params: {
          offset: 0,
          limit: 10,
        },
        failOnStatusCode: true,
      });
    });

    test("Get tags should be successful", async ({ request }) => {
      //Act
      const response = await request.get("/api/tags", {
        failOnStatusCode: true,
      });
    });

    test("Update settings should be successful", async ({ request }) => {
      //Act
      const response = await request.put("/api/user", {
        data: {
          email: "vs.nahlenko@gmail.com",
          username: "nahlenko",
          bio: "hello",
          image: "000",
          title: "test",
          password: "Qwerty0908",
        },
        failOnStatusCode: true,
      });
    });
  },
);
