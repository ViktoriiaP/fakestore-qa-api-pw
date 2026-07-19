import { step } from "../utils/stepsDecorator";
import { ArticleController } from "../controllers/ArticleController";

export class ArticleStep extends ArticleController {
  @step
  async createAndGetArticle() {
    //const response = await this.createArticle({});
    const response1 = await this.getArticles();
    // return response;
  }
}
