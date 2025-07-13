import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreatePostInput,
  createPostSchema,
  GetPostInput,
  getPostSchema,
  GetPostsInput,
  getPostsSchema,
  UpdatePostInput,
  updatePostSchema,
} from "./schema";
import * as policy from "./policy";

export class PostsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getPostsSchema)
  @isAuthorized(policy.getAll)
  public async getPosts(req: Request, res: Response, next: NextFunction, @Query query?: GetPostsInput): Promise<any> {
    return this.services.admin.posts.getPosts(query!);
  }

  @RouteHandler()
  @ValidateSchema(createPostSchema)
  @isAuthorized(policy.create)
  public async createPost(req: Request, res: Response, next: NextFunction, @Body body?: CreatePostInput): Promise<any> {
    return this.services.admin.posts.createPost(body!, req.account!.id);
  }

  @RouteHandler()
  @ValidateSchema(getPostSchema)
  @isAuthorized(policy.getAll)
  public async getPost(req: Request, res: Response, next: NextFunction, @Query query?: GetPostInput): Promise<any> {
    return this.services.admin.posts.getPost({
      postId: req.params.id as string,
      profileId: query!.profileId,
    });
  }

  @RouteHandler()
  @ValidateSchema(updatePostSchema)
  @isAuthorized(policy.create)
  public async updatePost(req: Request, res: Response, next: NextFunction, @Body body?: UpdatePostInput): Promise<any> {
    return this.services.admin.posts.updatePost({
      ...body!,
      postId: req.params.id as string,
    });
  }
}
