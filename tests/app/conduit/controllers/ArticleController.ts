import { BaseController } from "./BaseController";

export class ArticleController extends BaseController {
  // property або властивість
  articlesEndpoint = "/api/articles";

  // метод або method
  async getArticles(
    params?: {
      offset?: number;
      limit?: number;
      tag?: string;
      author?: string;
      favorited?: string;
    },
    options?: { failOnStatusCode?: boolean | undefined },
  ) {
    const response = await this.request.get(this.articlesEndpoint, {
      params: params,
      failOnStatusCode: options?.failOnStatusCode,
    });

    return response;
  }

  async createArticle(
    article: {
      title?: string;
      description?: string;
      body?: string;
      tagList: Array<string>;
    },
    options?: {
      failOnStatusCode?: boolean;
      timeout?: number;
      isCleanup?: boolean;
    },
  ) {
    const response = await this.request.post("/api/articles", {
      data: {
        article: article,
      },
      failOnStatusCode: options?.failOnStatusCode,
      timeout: options?.timeout,
    });

    if (options?.isCleanup) {
      const json = await response.json();
      const slug = json["slug"];

      // cleanupQueue.push(slug)
    }

    return response;
  }
}
