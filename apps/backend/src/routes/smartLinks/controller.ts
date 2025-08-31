import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreateSmartLinkInput,
  createSmartLinkSchema,
  GetManySmartLinksInput,
  getSmartLinkAnalyticsSchema,
  UpdateSmartLinkInput,
} from "./schema";
import * as policy from "./policy";
import { getManySmartLinksSchema, updateSmartLinkSchema } from "./schema";
import { profileIdQuerySchema } from "../schema";

export class SmartLinksController extends BaseController {
  @RouteHandler()
  @ValidateSchema(createSmartLinkSchema)
  @isAuthorized(policy.create)
  public async createSmartLink(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateSmartLinkInput,
  ): Promise<any> {
    return this.services.admin.smartLink.createSmartLink(body!);
  }

  @RouteHandler()
  @ValidateSchema(getManySmartLinksSchema)
  @isAuthorized(policy.getAll)
  public async getManySmartLinks(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetManySmartLinksInput,
  ): Promise<any> {
    return this.services.admin.smartLink.getManySmartLinks(query!);
  }

  @RouteHandler()
  @ValidateSchema(updateSmartLinkSchema)
  @isAuthorized(policy.create)
  public async updateSmartLink(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateSmartLinkInput,
  ): Promise<any> {
    return this.services.admin.smartLink.updateSmartLink({
      ...body!,
      smartLinkId: req.params.id,
    });
  }

  @RouteHandler()
  @isAuthorized(policy.create)
  @ValidateSchema(profileIdQuerySchema)
  public async archiveSmartLink(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.smartLink.archiveSmartLink({
      smartLinkId: req.params.id,
      profileId: req.query.profileId as string,
    });
  }

  @RouteHandler()
  @isAuthorized(policy.create)
  @ValidateSchema(profileIdQuerySchema)
  public async unarchiveSmartLink(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.smartLink.unarchiveSmartLink({
      smartLinkId: req.params.id,
      profileId: req.query.profileId as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(getSmartLinkAnalyticsSchema)
  @isAuthorized(policy.create)
  public async getSmartLinkAnalytics(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.smartLink.getSmartLinkAnalytics({
      smartLinkId: req.params.id,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      profileId: req.query.profileId as string,
    });
  }
}
