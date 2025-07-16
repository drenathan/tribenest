import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { CreateOrderInput, createOrderSchema, finalizeOrderSchema, FinalizeOrderInput } from "./schema";
import { OrderStatus } from "@src/db/types/product";
import { PaymentProviderName } from "@src/services/paymentProvider/PaymentProvider";
import { PaymentProviderFactory } from "@src/services/paymentProvider/PaymentProviderFactory";
import { NotFoundError } from "@src/utils/app_error";

export class PublicOrders extends BaseController {
  @RouteHandler()
  @ValidateSchema(createOrderSchema)
  public async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateOrderInput,
  ): Promise<any> {
    const result = await this.services.public.order.create({
      ...body!,
      status: OrderStatus.InitiatedPayment,
    });
    return result;
  }

  @RouteHandler()
  @ValidateSchema(finalizeOrderSchema)
  public async finalizeOrder(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: FinalizeOrderInput,
  ): Promise<any> {
    const { paymentId, paymentProviderName, profileId } = body!;
    const profile = await this.services.profile.getProfile(profileId);
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    const paymentProvider = PaymentProviderFactory.create(paymentProviderName as PaymentProviderName, {
      apiKeys: {
        publicKey: profile.paymentProviderPublicKey!,
        privateKey: profile.paymentProviderPrivateKey!,
      },
    });
    const paymentStatus = await paymentProvider.getPaymentStatus(paymentId);

    const order = await this.services.public.order.finalizePayment({
      paymentId,
      paymentStatus,
      profileId,
    });

    if (order.status === OrderStatus.Paid) {
      await this.workers.jobs.order.processOrder.now({ orderId: order.id, profileId });
    }

    return order;
  }
}
