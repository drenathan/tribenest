import { isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { Body } from "@src/decorators";
import {
  ActivateThemeInput,
  activateThemeSchema,
  GetManyWebsitesInput,
  getManySchema,
  UpdateWebsiteVersionInput,
  updateWebsiteVersionSchema,
  GetMessagesInput,
  getMessagesSchema,
} from "./schema";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import * as policy from "./policy";
import { ProfileIdInput, profileIdQuerySchema } from "../schema";

export class WebsitesController extends BaseController {
  @RouteHandler()
  @ValidateSchema(activateThemeSchema)
  @isAuthorized(policy.create)
  public async activateTheme(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: ActivateThemeInput,
  ): Promise<any> {
    return this.services.website.activateTheme(body!);
  }

  @RouteHandler()
  @ValidateSchema(getManySchema)
  @isAuthorized(policy.getMany)
  public async getMany(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetManyWebsitesInput,
  ): Promise<any> {
    return this.services.website.getWebsitesForProfile(query!.profileId);
  }

  @RouteHandler()
  @ValidateSchema(getManySchema)
  @isAuthorized(policy.getMany)
  public async getOne(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetManyWebsitesInput,
  ): Promise<any> {
    const websiteVersionId = req.params.id as string;
    return this.services.website.getWebsite(websiteVersionId, query!.profileId);
  }

  @RouteHandler()
  @ValidateSchema(updateWebsiteVersionSchema)
  @isAuthorized(policy.create)
  public async updateWebsiteVersion(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateWebsiteVersionInput,
  ): Promise<any> {
    const websiteVersionId = req.params.id as string;
    return this.services.website.updateWebsiteVersion(body!, websiteVersionId);
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.getMany)
  public async publishWebsiteVersion(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: ProfileIdInput,
  ): Promise<any> {
    const websiteVersionId = req.params.id as string;
    return this.services.website.publishWebsiteVersion(websiteVersionId, query!.profileId);
  }

  @RouteHandler()
  @ValidateSchema(getMessagesSchema)
  @isAuthorized(policy.getMany)
  public async getMessages(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetMessagesInput,
  ): Promise<any> {
    return this.services.website.getMessages(query!);
  }
}
