//https://conduit-api.learnwebdriverio.com/api/users

import { BaseController } from "./BaseController";

export class AuthController extends BaseController {
  async login() {}
}

export class AuthHelper extends AuthController {
  authHelper = "AuthHelper";
}

export class AuthSteps extends AuthHelper {
  authSteps = "AuthSteps";
}
