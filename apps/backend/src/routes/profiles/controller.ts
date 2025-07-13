import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreateProfileInput,
  createProfileSchema,
  GetMediaInput,
  getMediaSchema,
  UploadMediaInput,
  uploadMediaSchema,
  ValidateSubdomainInput,
  validateSubdomainSchema,
} from "./schema";
import * as policy from "./policy";

export class ProfilesController extends BaseController {
  @RouteHandler({ statusCode: 200 })
  @ValidateSchema(validateSubdomainSchema)
  public async validateSubdomain(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: ValidateSubdomainInput,
  ): Promise<any> {
    return this.services.profile.validateSubdomain(body!.subdomain);
  }

  @ValidateSchema(createProfileSchema)
  @RouteHandler({ statusCode: 201 })
  public async createProfile(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateProfileInput,
  ): Promise<any> {
    await this.services.profile.createProfile(body!, req.account!.id);
    return true;
  }

  @RouteHandler({ statusCode: 201 })
  @ValidateSchema(uploadMediaSchema)
  @isAuthorized(policy.uploadMedia)
  public async uploadMedia(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UploadMediaInput,
  ): Promise<any> {
    const { id } = req.params;
    return this.services.profile.uploadMedia(body!, id);
  }

  @RouteHandler({ statusCode: 200 })
  @ValidateSchema(getMediaSchema)
  public async getMedia(req: Request, res: Response, next: NextFunction, @Query query?: GetMediaInput): Promise<any> {
    const { id } = req.params;
    return this.services.profile.getMedia(query!, id);
  }
}
