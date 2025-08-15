import { Body, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { CreateOrderInput, createOrderSchema, finalizeOrderSchema, FinalizeOrderInput } from "./schema";
import { OrderStatus } from "@src/db/types/product";

export class PublicOrders extends BaseController {
  @RouteHandler()
  @ValidateSchema(createOrderSchema)
  public async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateOrderInput,
  ): Promise<any> {
    return this.services.public.order.create(body!);
  }

  @RouteHandler()
  @ValidateSchema(finalizeOrderSchema)
  public async finalizeOrder(
    ___: Request,
    __: Response,
    _: NextFunction,
    @Body body?: FinalizeOrderInput,
  ): Promise<any> {
    const order = await this.services.public.order.finalizePayment(body!);

    if (order.status === OrderStatus.Paid) {
      await this.workers.jobs.order.processOrder.now({ orderId: order.id, profileId: body!.profileId });
    }

    return order;
  }

  @RouteHandler()
  public async getOrders(req: Request, res: Response, next: NextFunction): Promise<any> {
    const orders = await this.services.public.order.getOrders(req.account!.id);
    return orders;
  }
}
