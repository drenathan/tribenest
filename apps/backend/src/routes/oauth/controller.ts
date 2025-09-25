import { RouteHandler } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";

export class OauthController extends BaseController {
  @RouteHandler()
  public async createYoutubeOauthUrl(req: Request, res: Response, next: NextFunction): Promise<any> {}
}
