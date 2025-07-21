import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import { CreateSmartLinkInput, createSmartLinkSchema, GetManySmartLinksInput, UpdateSmartLinkInput } from "./schema";
import * as policy from "./policy";
import { getManySmartLinksSchema, updateSmartLinkSchema } from "./schema";

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
  public async archiveSmartLink(req: Request, res: Response, next: NextFunction): Promise<any> {
    return true;
  }

  @RouteHandler()
  @isAuthorized(policy.create)
  public async unarchiveSmartLink(req: Request, res: Response, next: NextFunction): Promise<any> {
    return true;
  }
}
