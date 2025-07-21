import { BaseService, BaseServiceArgs } from "../baseService";
import { OrderService } from "./order";
import { PostService } from "./posts";
import { ProductService } from "./product";
import { SmartLinkService } from "./smartLink";

export class AdminService extends BaseService {
  public readonly posts: PostService;
  public readonly products: ProductService;
  public readonly orders: OrderService;
  public readonly smartLink: SmartLinkService;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.posts = new PostService(args);
    this.products = new ProductService(args);
    this.orders = new OrderService(args);
    this.smartLink = new SmartLinkService(args);
  }
}
