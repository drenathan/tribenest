import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  GetStreamTemplatesInput,
  CreateStreamTemplateInput,
  getStreamTemplatesSchema,
  createStreamTemplateSchema,
  updateStreamTemplateSchema,
  UpdateStreamTemplateInput,
} from "./schema";
import * as policy from "./policy";

export class StreamsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getStreamTemplatesSchema)
  @isAuthorized(policy.getAll)
  public async getStreamTemplates(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetStreamTemplatesInput,
  ): Promise<any> {
    return this.services.admin.streams.getStreamTemplates(query!);
  }
  @RouteHandler()
  @ValidateSchema(getStreamTemplatesSchema)
  @isAuthorized(policy.getAll)
  public async getStreamTemplate(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.streams.getStreamTemplate({
      templateId: req.params.id,
      profileId: req.query.profileId as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(createStreamTemplateSchema)
  @isAuthorized(policy.create)
  public async createStreamTemplate(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateStreamTemplateInput,
  ): Promise<any> {
    return this.services.admin.streams.createStreamTemplate(body!);
  }

  @RouteHandler()
  @ValidateSchema(updateStreamTemplateSchema)
  @isAuthorized(policy.update)
  public async updateStreamTemplate(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateStreamTemplateInput,
  ): Promise<any> {
    return this.services.admin.streams.updateStreamTemplate(body!);
  }
}
