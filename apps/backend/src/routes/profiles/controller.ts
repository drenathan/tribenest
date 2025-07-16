import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { Body, RouteHandler, ValidateSchema } from "@src/decorators";
import {
  createProfileSchema,
  CreateProfileInput,
  uploadMediaSchema,
  UploadMediaInput,
  getMediaSchema,
  GetMediaInput,
  validateSubdomainSchema,
  ValidateSubdomainInput,
  updateProfileConfigurationSchema,
  UpdateProfileConfigurationInput,
} from "./schema";

export class ProfilesController extends BaseController {
  @ValidateSchema(createProfileSchema)
  @RouteHandler()
  async createProfile(req: Request, res: Response, _: NextFunction, @Body body?: CreateProfileInput): Promise<any> {
    const { name, subdomain } = body!;
    const result = await this.services.profile.createProfile({ name, subdomain }, req.account!.id);
    return result;
  }

  @ValidateSchema(validateSubdomainSchema)
  @RouteHandler()
  async validateSubdomain(
    req: Request,
    res: Response,
    _: NextFunction,
    @Body body?: ValidateSubdomainInput,
  ): Promise<any> {
    const { subdomain } = body!;
    const isValid = await this.services.profile.validateSubdomain(subdomain);
    return { isValid };
  }

  @ValidateSchema(uploadMediaSchema)
  @RouteHandler()
  async uploadMedia(req: Request, res: Response, _: NextFunction, @Body body?: UploadMediaInput): Promise<any> {
    const result = await this.services.profile.uploadMedia(body!, req.account!.id);
    return result;
  }

  @ValidateSchema(getMediaSchema)
  @RouteHandler()
  async getMedia(req: Request, res: Response, _: NextFunction, @Body body?: GetMediaInput): Promise<any> {
    const result = await this.services.profile.getMedia(body!, req.account!.id);
    return result;
  }

  @RouteHandler()
  async getProfileConfiguration(req: Request, res: Response, _: NextFunction): Promise<any> {
    const { id } = req.params;
    const config = await this.services.profile.getProfileConfiguration(id);
    return config;
  }

  @ValidateSchema(updateProfileConfigurationSchema)
  @RouteHandler()
  async updateProfileConfiguration(
    req: Request,
    res: Response,
    _: NextFunction,
    @Body body?: UpdateProfileConfigurationInput,
  ): Promise<any> {
    const { id } = req.params;
    const { email, r2, payment } = body!;

    const updateData: any = {};
    if (email) updateData.email = email;
    if (r2) updateData.r2 = r2;
    if (payment) updateData.payment = payment;

    const result = await this.services.profile.updateProfileConfiguration(id, updateData);
    return result;
  }

  @RouteHandler()
  async testEmailConfiguration(req: Request, res: Response, _: NextFunction): Promise<any> {
    const { profileId, testEmail } = req.body;
    const result = await this.services.profile.testEmailConfiguration(profileId, testEmail);
    return result;
  }

  @RouteHandler()
  async testR2Configuration(req: Request, res: Response, _: NextFunction): Promise<any> {
    const { profileId } = req.body;
    const result = await this.services.profile.testR2Configuration(profileId);
    return result;
  }

  @RouteHandler()
  async testPaymentConfiguration(req: Request, res: Response, _: NextFunction): Promise<any> {
    const { profileId } = req.body;
    const result = await this.services.profile.testPaymentConfiguration(profileId);
    return result;
  }
}
