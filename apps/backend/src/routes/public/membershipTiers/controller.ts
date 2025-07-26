import { Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { GetMembershipTiersInput, getMembershipTiersSchema } from "@src/routes/membershipTiers/schema";
import { NextFunction, Request, Response } from "express";

export class PublicMembershipTier extends BaseController {
  @RouteHandler()
  @ValidateSchema(getMembershipTiersSchema)
  public async getMembershipTiers(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetMembershipTiersInput,
  ): Promise<any> {
    return this.services.membership.getMembershipTiers({ profileId: query!.profileId, removeArchived: true });
  }
}
