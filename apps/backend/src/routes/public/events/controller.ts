import { RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@src/utils/app_error";
import { profileIdQuerySchema } from "@src/routes/schema";

export class PublicEvents extends BaseController {
  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  public async getMany(req: Request, res: Response, next: NextFunction): Promise<any> {
    const events = await this.services.admin.event.getEvents({
      profileId: req.query.profileId as string,
      filter: {
        upcoming: "upcoming",
      },
      page: 1,
      limit: 20,
    });

    return events.data;
  }
}
