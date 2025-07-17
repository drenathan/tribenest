import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import {
  commentSchema,
  commentListSchema,
  commentCountSchema,
  CommentInput,
  CommentListInput,
  CommentCountInput,
} from "./schema";
import { UnauthorizedError } from "@src/utils/app_error";

export class PublicComments extends BaseController {
  @RouteHandler()
  @ValidateSchema(commentSchema)
  public async addComment(req: Request, res: Response, next: NextFunction, @Body body?: CommentInput): Promise<any> {
    const { entityId, entityType, content } = body!;
    const accountId = req.account!.id;

    const comment = await this.services.public.comment.create({ entityId, entityType, accountId, content });
    return { comment };
  }

  @RouteHandler()
  public async deleteComment(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    const accountId = req.account!.id;

    // Only allow deleting own comment
    const comment = await this.services.public.comment.findById(id);
    if (!comment || comment.accountId !== accountId) {
      return new UnauthorizedError("You are not authorized to delete this comment");
    }

    await this.services.public.comment.delete(id);
    return { success: true };
  }

  @RouteHandler()
  @ValidateSchema(commentListSchema)
  public async getComments(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: CommentListInput,
  ): Promise<any> {
    const { entityId, entityType, page = 1, limit = 20 } = query!;

    const comments = await this.services.public.comment.findMany({ entityId, entityType, page, limit });
    return { comments };
  }

  @RouteHandler()
  @ValidateSchema(commentCountSchema)
  public async getCommentCount(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: CommentCountInput,
  ): Promise<any> {
    const { entityId, entityType } = query!;

    const count = await this.services.public.comment.count({ entityId, entityType });
    return { count };
  }
}
