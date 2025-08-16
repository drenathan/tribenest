import { isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import { GetOrdersInput, getOrdersSchema } from "./schema";
import * as policy from "./policy";
import { ProfileIdInput, profileIdQuerySchema } from "../schema";

export class OrdersController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getOrdersSchema)
  @isAuthorized(policy.read)
  public async getOrders(req: Request, res: Response, next: NextFunction, @Query query?: GetOrdersInput): Promise<any> {
    return this.services.admin.orders.getOrders(query!);
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.read)
  public async getOrderById(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: ProfileIdInput,
  ): Promise<any> {
    return this.services.admin.orders.getOrderById({
      profileId: query!.profileId,
      orderId: req.params.id as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.read)
  public async fullFillOrder(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: ProfileIdInput,
  ): Promise<any> {
    return this.services.admin.orders.fullFillOrder({
      profileId: query!.profileId,
      deliveryGroupId: req.params.id as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.read)
  public async resendDigitalDelivery(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: ProfileIdInput,
  ): Promise<any> {
    await this.workers.jobs.order.resendDigitalDelivery.now({
      deliveryGroupId: req.params.id as string,
    });
  }
}
