import { APIRequestContext } from "@playwright/test";
import { ArticleController } from "./ArticleController";
import { AuthController } from "./AuthController";
import { UserController } from "./UserController";

export class ApiController {
  articleController: ArticleController;
  authController: AuthController;
  userController: UserController;

  constructor(request: APIRequestContext) {
    this.articleController = new ArticleController(request);
    this.authController = new AuthController(request);
    this.userController = new UserController(request);
  }
}
