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
  UpdateMembershipTierInput,
  updateMembershipTierSchema,
  ReorderMembershipTiersInput,
  reorderMembershipTiersSchema,
} from "./schema";
import * as policy from "./policy";
import { profileIdQuerySchema } from "../schema";

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
  @ValidateSchema(updateMembershipTierSchema)
  @isAuthorized(policy.update)
  public async updateMembershipTier(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateMembershipTierInput,
  ): Promise<any> {
    const { id } = req.params;
    return this.services.membership.updateMembershipTier({ ...body!, id });
  }

  @RouteHandler()
  @isAuthorized(policy.update)
  @ValidateSchema(profileIdQuerySchema)
  public async archiveMembershipTier(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    return this.services.membership.archiveMembershipTier({ id, profileId: req.query.profileId as string });
  }

  @RouteHandler()
  @isAuthorized(policy.update)
  @ValidateSchema(profileIdQuerySchema)
  public async unarchiveMembershipTier(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    return this.services.membership.unarchiveMembershipTier({ id, profileId: req.query.profileId as string });
  }

  @RouteHandler()
  @ValidateSchema(reorderMembershipTiersSchema)
  @isAuthorized(policy.update)
  public async reorderMembershipTiers(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: ReorderMembershipTiersInput,
  ): Promise<any> {
    return this.services.membership.reorderMembershipTiers(body!);
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
