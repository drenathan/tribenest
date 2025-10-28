import { Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { ProfileIdInput, profileIdQuerySchema } from "@src/routes/schema";

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
}
