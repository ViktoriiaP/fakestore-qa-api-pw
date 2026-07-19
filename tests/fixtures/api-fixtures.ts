import { test as base } from "../fixtures/auth.fixtures";
import { ArticleController } from "../app/conduit/controllers/ArticleController";
import { UserController } from "../app/conduit/controllers/UserController";
import { AuthController } from "../app/conduit/controllers/AuthController";

type Fixtures = {
  articleController: ArticleController;
  userController: UserController;
  authController: AuthController;
};

export const test = base.extend<Fixtures>({
  articleController: async ({ request }, use) => {
    await use(new ArticleController(request));
  },
  userController: async ({ request }, use) => {
    await use(new UserController(request));
  },
  authController: async ({ request }, use) => {
    await use(new AuthController(request));
  },
});

export { expect } from "@playwright/test";
