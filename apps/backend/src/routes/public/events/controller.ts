import { Body, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@src/utils/app_error";
import { profileIdQuerySchema } from "@src/routes/schema";
import {
  CreateOrderInput,
  createOrderSchema,
  FinalizeOrderInput,
  finalizeOrderSchema,
  ValidateEventPassInput,
  validateEventPassSchema,
} from "./schema";
import { OrderStatus } from "@src/db/types/product";

export class PublicEvents extends BaseController {
  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  public async getMany(req: Request, res: Response, next: NextFunction): Promise<any> {
    const events = await this.services.admin.event.getEvents({
      profileId: req.query.profileId as string,
      filter: {
        upcoming: "upcoming",
      },
      page: 1,
      limit: 20,
    });

    return events.data;
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  public async getEventById(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.public.events.getEventById({
      eventId: req.params.id,
      profileId: req.query.profileId as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(createOrderSchema)
  public async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateOrderInput,
  ): Promise<any> {
    return this.services.public.events.createOrder({ ...body!, eventId: req.params.id as string });
  }

  @RouteHandler()
  @ValidateSchema(finalizeOrderSchema)
  public async finalizeOrder(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: FinalizeOrderInput,
  ): Promise<any> {
    const order = await this.services.public.events.finalizeOrder(body!);

    if (order.status === OrderStatus.Paid) {
      await this.workers.jobs.order.processTicketOrder.now({
        profileId: req.body.profileId,
        orderId: order.id!,
      });
    }
    return order;
  }

  @RouteHandler()
  @ValidateSchema(validateEventPassSchema)
  public async validateEventPass(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: ValidateEventPassInput,
  ): Promise<any> {
    return this.services.public.events.validateEventPass(body!);
  }
}
