import { RouteHandler } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@src/utils/app_error";

export class PublicSmartLinks extends BaseController {
  @RouteHandler()
  public async getOne(req: Request, res: Response, next: NextFunction): Promise<any> {
    const link = await this.services.admin.smartLink.getSmartLink({
      smartLinkId: req.query.id as string,
      path: req.query.path as string,
    });
    if (!link) {
      throw new NotFoundError("Link not found");
    }
    return link;
  }
}
