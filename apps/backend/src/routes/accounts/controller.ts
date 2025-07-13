import { Body, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import { CreateAccountInput, createAccountSchema } from "./schema";

export class AccountsController extends BaseController {
  @RouteHandler({ statusCode: 201 })
  @ValidateSchema(createAccountSchema)
  public async createAccount(
    req: Request,
    _: Response,
    __: NextFunction,
    @Body body?: CreateAccountInput,
  ): Promise<any> {
    const { account, token } = await this.services.account.createAccount(body!, req.useragent);
    return { account, token };
  }

  @RouteHandler({ statusCode: 200 })
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<any> {
    return req.account;
  }

  @RouteHandler({ statusCode: 200 })
  public async getAuthorizations(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.account.getProfileAuthorizations(req.account!.id);
  }
}
