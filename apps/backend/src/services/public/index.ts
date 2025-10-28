import { BaseService, BaseServiceArgs } from "../baseService";
import { PublicBroadcastsService } from "./broadcasts";
import { CommentsService } from "./comments";
import { EmailListService } from "./emailList";
import { EventsService } from "./events";
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
  public readonly events: EventsService;
  public readonly broadcasts: PublicBroadcastsService;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.emailList = new EmailListService(args);
    this.post = new PostService(args);
    this.product = new ProductService(args);
    this.order = new OrderService(args);
    this.comment = new CommentsService(args);
    this.like = new LikesService(args);
    this.saved = new SavesService(args);
    this.events = new EventsService(args);
    this.broadcasts = new PublicBroadcastsService(args);
  }
}
