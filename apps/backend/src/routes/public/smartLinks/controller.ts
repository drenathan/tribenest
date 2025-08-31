import { RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@src/utils/app_error";
import { trackEventSchema } from "./schema";

export class PublicSmartLinks extends BaseController {
  @RouteHandler()
  public async getOne(req: Request, res: Response, next: NextFunction): Promise<any> {
    const link = await this.services.admin.smartLink.getSmartLink({
      smartLinkId: req.query.id as string,
      path: req.query.path as string,
    });
    if (!link) {
      throw new NotFoundError("Link not found");
    }
    return link;
  }

  @RouteHandler()
  @ValidateSchema(trackEventSchema)
  public async trackEvent(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.smartLink.trackEvent({
      path: req.body.path,
      eventType: req.body.eventType,
      eventData: { ...req.body.eventData, userAgent: req.useragent },
      ip: req.ip,
    });
  }
}
