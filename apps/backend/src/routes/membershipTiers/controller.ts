import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreateMembershipTierInput,
  createMembershipTierSchema,
  GetMembershipTiersInput,
  getMembershipTiersSchema,
  UpdateMembershipTierBenefitsInput,
  updateMembershipTierBenefitsSchema,
} from "./schema";
import * as policy from "./policy";

export class MembershipTiersController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getMembershipTiersSchema)
  @isAuthorized(policy.getAll)
  public async getMembershipTiers(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetMembershipTiersInput,
  ): Promise<any> {
    return this.services.membership.getMembershipTiers(query!.profileId);
  }

  @RouteHandler()
  @ValidateSchema(createMembershipTierSchema)
  @isAuthorized(policy.create)
  public async createMembershipTier(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateMembershipTierInput,
  ): Promise<any> {
    return this.services.membership.createMembershipTier(body!);
  }

  @RouteHandler()
  @ValidateSchema(updateMembershipTierBenefitsSchema)
  @isAuthorized(policy.create)
  public async updateMembershipTierBenefits(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateMembershipTierBenefitsInput,
  ): Promise<any> {
    const { id } = req.params;
    return this.services.membership.updateMembershipTierBenefits({ id, benefits: body!.benefits });
  }
}
