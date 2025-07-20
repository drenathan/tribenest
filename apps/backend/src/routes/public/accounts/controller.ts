import { Body, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreatePublicAccountInput,
  createPublicAccountSchema,
  UpdatePublicAccountInput,
  updatePublicAccountSchema,
  UpdatePublicAccountPasswordInput,
  updatePublicAccountPasswordSchema,
} from "./schema";

export class PublicAccountsController extends BaseController {
  @RouteHandler({ statusCode: 201 })
  @ValidateSchema(createPublicAccountSchema)
  public async createAccount(
    req: Request,
    _: Response,
    __: NextFunction,
    @Body body?: CreatePublicAccountInput,
  ): Promise<any> {
    const { account, token } = await this.services.account.createAccount(body!, req.useragent);
    await this.services.membership.createMembership({
      profileId: body!.profileId,
      accountId: account.id,
      membershipTierId: body!.membershipTierId,
    });
    return { account, token };
  }

  @RouteHandler({ statusCode: 200 })
  public async getMe(req: Request, _: Response, __: NextFunction): Promise<any> {
    return {
      ...req.account,
      membership: req.membership,
    };
  }

  @RouteHandler({ statusCode: 200 })
  @ValidateSchema(updatePublicAccountSchema)
  public async updateMe(
    req: Request,
    _: Response,
    __: NextFunction,
    @Body body?: UpdatePublicAccountInput,
  ): Promise<any> {
    return this.services.account.updateAccount(req.account!.id, body!);
  }

  @RouteHandler({ statusCode: 200 })
  @ValidateSchema(updatePublicAccountPasswordSchema)
  public async updatePassword(
    req: Request,
    _: Response,
    __: NextFunction,
    @Body body?: UpdatePublicAccountPasswordInput,
  ): Promise<any> {
    return this.services.account.updateAccountPassword(req.account!.id, body!);
  }
}
