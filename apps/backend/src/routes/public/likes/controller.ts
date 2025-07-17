import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { likeSchema, likeStatusSchema, likeCountSchema, LikeInput, LikeStatusInput, LikeCountInput } from "./schema";

export class PublicLikes extends BaseController {
  @RouteHandler()
  @ValidateSchema(likeSchema)
  public async like(req: Request, res: Response, next: NextFunction, @Body body?: LikeInput): Promise<any> {
    const { entityId, entityType } = body!;
    const accountId = req.account!.id;

    await this.services.public.like.create({ entityId, entityType, accountId });
    return { success: true };
  }

  @RouteHandler()
  @ValidateSchema(likeSchema)
  public async unlike(req: Request, res: Response, next: NextFunction, @Body body?: LikeInput): Promise<any> {
    const { entityId, entityType } = body!;
    const accountId = req.account!.id;

    await this.services.public.like.delete({ entityId, entityType, accountId });
    return { success: true };
  }

  @RouteHandler()
  @ValidateSchema(likeStatusSchema)
  public async getLikeStatus(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: LikeStatusInput,
  ): Promise<any> {
    const { entityId, entityType } = query!;
    const accountId = req.account!.id;

    const liked = await this.services.public.like.exists({ entityId, entityType, accountId });
    return { liked };
  }

  @RouteHandler()
  @ValidateSchema(likeCountSchema)
  public async getLikeCount(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: LikeCountInput,
  ): Promise<any> {
    const { entityId, entityType } = query!;

    const count = await this.services.public.like.count({ entityId, entityType });
    return { count };
  }
}
