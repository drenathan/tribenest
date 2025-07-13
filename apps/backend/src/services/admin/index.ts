import { BaseService, BaseServiceArgs } from "../baseService";
import { PostService } from "./posts";
import { ProductService } from "./product";

export class AdminService extends BaseService {
  public readonly posts: PostService;
  public readonly products: ProductService;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.posts = new PostService(args);
    this.products = new ProductService(args);
  }
}
