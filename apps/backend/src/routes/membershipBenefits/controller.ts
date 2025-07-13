import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreateMembershipBenefitInput,
  createMembershipBenefitSchema,
  GetMembershipBenefitsInput,
  getMembershipBenefitsSchema,
} from "./schema";
import * as policy from "./policy";

export class MembershipBenefitsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getMembershipBenefitsSchema)
  @isAuthorized(policy.getAll)
  public async getMembershipBenefits(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetMembershipBenefitsInput,
  ): Promise<any> {
    return this.services.membership.getMembershipBenefits(query!.profileId);
  }

  @RouteHandler()
  @ValidateSchema(createMembershipBenefitSchema)
  @isAuthorized(policy.create)
  public async createMembershipBenefit(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateMembershipBenefitInput,
  ): Promise<any> {
    return this.services.membership.createMembershipBenefit(body!);
  }
}
