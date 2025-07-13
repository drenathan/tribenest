import { NextFunction, Request, Response } from "express";
import { BaseController } from "../baseController";
import { CreateSessionInput, createSessionSchema } from "./schema";
import { RouteHandler, ValidateSchema, Body } from "@src/decorators";

export class SessionsController extends BaseController {
  @RouteHandler({ statusCode: 201 })
  @ValidateSchema(createSessionSchema)
  public async createSession(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateSessionInput,
  ): Promise<any> {
    const { account, token } = await this.services.account.login(body!, req.useragent);
    return { account, token };
  }

  @RouteHandler({ statusCode: 204 })
  public async deleteSession(req: Request, res: Response, next: NextFunction) {
    await this.services.account.logout(req.session!.id);
    return;
  }
}
