import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { ContactInput, contactSchema, GetWebsiteInput, getWebsiteSchema, trackEventSchema } from "./schema";
import { profileIdQuerySchema } from "@src/routes/schema";

export class PublicWebsiteController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getWebsiteSchema)
  public async getWebsite(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetWebsiteInput,
  ): Promise<any> {
    const { subdomain, pathname } = query!;
    const website = await this.services.website.getPublicWebsite({ subdomain, pathname });
    return website;
  }

  @RouteHandler()
  @ValidateSchema(contactSchema)
  public async contact(req: Request, res: Response, next: NextFunction, @Body body?: ContactInput): Promise<any> {
    const result = await this.services.website.contact(body!);
    return result;
  }

  @RouteHandler()
  @ValidateSchema(trackEventSchema)
  public async trackEvent(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.website.trackEvent({
      subdomain: req.body.subdomain,
      eventType: req.body.eventType,
      eventData: { ...req.body.eventData, userAgent: req.useragent },
      ip: req.ip,
    });
  }
}
