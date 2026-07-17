import { test } from "../../fixtures/getToken.fixtures";
import { TAG } from "../../app/tags";
import { env } from "node:process";
import { generateUniqueTitle } from "../../data/data-generator";

test.describe(
  "Create article",
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
  },
);
