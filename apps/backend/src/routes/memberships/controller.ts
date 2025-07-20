import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import { GetMembershipsInput, getMembershipsSchema } from "./schema";
import * as policy from "./policy";

export class MembershipsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getMembershipsSchema)
  @isAuthorized(policy.read)
  public async getMemberships(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetMembershipsInput,
  ): Promise<any> {
    return this.services.membership.getProfileMemberships(query!);
  }
}
