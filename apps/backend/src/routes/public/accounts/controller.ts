import { Body, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { CreatePublicAccountInput, createPublicAccountSchema } from "./schema";

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
}
