import { isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import { GetOrdersInput, getOrdersSchema } from "./schema";
import * as policy from "./policy";

export class OrdersController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getOrdersSchema)
  @isAuthorized(policy.read)
  public async getOrders(req: Request, res: Response, next: NextFunction, @Query query?: GetOrdersInput): Promise<any> {
    return this.services.admin.orders.getOrders(query!);
  }
}
