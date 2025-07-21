import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import {
  joinEmailListSchema,
  JoinEmailListInput,
  unsubscribeFromEmailListSchema,
  UnsubscribeFromEmailListInput,
} from "./schema";

export class PublicEmailLists extends BaseController {
  @RouteHandler()
  @ValidateSchema(joinEmailListSchema)
  public async joinEmailList(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: JoinEmailListInput,
  ): Promise<any> {
    return this.services.public.emailList.joinEmailList(body!);
  }

  @RouteHandler()
  @ValidateSchema(unsubscribeFromEmailListSchema)
  public async unsubscribeFromEmailList(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: UnsubscribeFromEmailListInput,
  ): Promise<any> {
    return this.services.public.emailList.unsubscribeFromEmailList(query!);
  }
}
