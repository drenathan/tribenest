import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { ProfileIdInput, profileIdQuerySchema } from "@src/routes/schema";
import { LeaveBroadcastInput, leaveBroadcastSchema, ValidateSessionInput, validateSessionSchema } from "./schema";

export class PublicWebsiteController extends BaseController {
  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  public async getBroadcasts(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: ProfileIdInput,
  ): Promise<any> {
    return await this.services.public.broadcasts.getPublicBroadcasts({ profileId: query!.profileId });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  public async getBroadcast(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: ProfileIdInput,
  ): Promise<any> {
    return await this.services.public.broadcasts.getPublicBroadcast({
      profileId: query!.profileId,
      broadcastId: req.params.id,
    });
  }

  @RouteHandler()
  @ValidateSchema(leaveBroadcastSchema)
  public async leaveBroadcast(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: LeaveBroadcastInput,
  ): Promise<any> {
    return await this.services.public.broadcasts.leaveBroadcast({ ...body!, broadcastId: req.params.id });
  }

  @RouteHandler()
  @ValidateSchema(validateSessionSchema)
  public async validateSession(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: ValidateSessionInput,
  ): Promise<any> {
    return await this.services.public.broadcasts.validateSession({ ...body!, broadcastId: req.params.id });
  }
}
