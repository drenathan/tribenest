import { BaseService, BaseServiceArgs } from "../baseService";
import { OrderService } from "./order";
import { PostService } from "./post";
import { ProductService } from "./product";

export class PublicService extends BaseService {
  public readonly post: PostService;
  public readonly product: ProductService;
  public readonly order: OrderService;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.post = new PostService(args);
    this.product = new ProductService(args);
    this.order = new OrderService(args);
  }
}
