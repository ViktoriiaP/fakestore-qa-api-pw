import { APIRequestContext } from "@playwright/test";
import { BaseController } from "./BaseController";

export class UserController extends BaseController {
  endpoint = "/api/user";

  async updateUser(user: {
    email?: string;
    username?: string;
    bio?: string;
    image?: string;
    password?: string;
  }) {
    const response = await this.request.put(this.endpoint, {
      data: user,
      failOnStatusCode: true,
    });

    return response;
  }

  async createUser(user: {
    email: string;
    password: string;
    username: string;
  }) {
    const response = await this.request.post(this.endpoint, {
      data: user,
      failOnStatusCode: true,
    });

    return response;
  }

  async getCurrentUser() {
    const response = await this.request.get(this.endpoint, {
      failOnStatusCode: false,
    });

    return response;
  }
}
