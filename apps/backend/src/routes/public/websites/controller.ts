import { Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { GetWebsiteInput, getWebsiteSchema } from "./schema";

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
}
