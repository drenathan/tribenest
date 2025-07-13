import { Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { getPostsSchema, GetPostsInput } from "./schema";
import { NextFunction, Request, Response } from "express";

export class PublicPosts extends BaseController {
  @RouteHandler()
  @ValidateSchema(getPostsSchema)
  public async getPosts(req: Request, res: Response, next: NextFunction, @Query query?: GetPostsInput): Promise<any> {
    return this.services.public.post.getPosts(query!, req.membership);
  }
}
