import { Body, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import {
  startPaymentSchema,
  StartPaymentInput,
  createSubscriptionSchema,
  CreateSubscriptionInput,
  cancelSubscriptionSchema,
  CancelSubscriptionInput,
} from "./schema";
import { NotFoundError } from "@src/utils/app_error";

export class PublicPayments extends BaseController {
  @RouteHandler()
  @ValidateSchema(startPaymentSchema)
  public async startPayment(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: StartPaymentInput,
  ): Promise<any> {
    const profile = await this.services.profile.getProfile(body!.profileId);
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    const paymentProvider = await this.services.apis.getPaymentProvider(body!.profileId);

    const result = await paymentProvider.startCharge({
      amount: body!.amount,
      currency: "usd",
      email: body!.email,
      returnUrl: "http://drenathan1.localhost:3001/checkout",
    });

    return result;
  }

  @RouteHandler()
  @ValidateSchema(createSubscriptionSchema)
  public async createSubscription(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateSubscriptionInput,
  ): Promise<any> {
    if (body!.isChange) {
      return this.services.profile.payment.changeSubscription({
        ...body!,
        accountId: req.account!.id,
        email: req.account!.email,
        name: `${req.account!.firstName} ${req.account!.lastName}`,
      });
    }
    return this.services.profile.payment.createSubscription({
      ...body!,
      accountId: req.account!.id,
      email: req.account!.email,
      name: `${req.account!.firstName} ${req.account!.lastName}`,
    });
  }

  @RouteHandler()
  @ValidateSchema(cancelSubscriptionSchema)
  public async cancelSubscription(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CancelSubscriptionInput,
  ): Promise<any> {
    return this.services.profile.payment.cancelSubscription(body!);
  }
}
