import { BaseService, BaseServiceArgs } from "../baseService";
import { CommentsService } from "./comments";
import { EmailListService } from "./emailList";
import { LikesService } from "./likes";
import { OrderService } from "./order";
import { PostService } from "./post";
import { ProductService } from "./product";
import { SavesService } from "./saves";

export class PublicService extends BaseService {
  public readonly post: PostService;
  public readonly product: ProductService;
  public readonly order: OrderService;
  public readonly comment: CommentsService;
  public readonly like: LikesService;
  public readonly saved: SavesService;
  public readonly emailList: EmailListService;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.emailList = new EmailListService(args);
    this.post = new PostService(args);
    this.product = new ProductService(args);
    this.order = new OrderService(args);
    this.comment = new CommentsService(args);
    this.like = new LikesService(args);
    this.saved = new SavesService(args);
  }
}
