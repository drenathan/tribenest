import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { ContactInput, contactSchema, GetWebsiteInput, getWebsiteSchema } from "./schema";
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
}
