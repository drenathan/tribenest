import { BaseService, BaseServiceArgs } from "../baseService";
import { PostService } from "./post";
import { ProductService } from "./product";

export class PublicService extends BaseService {
  public readonly post: PostService;
  public readonly product: ProductService;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.post = new PostService(args);
    this.product = new ProductService(args);
  }
}
