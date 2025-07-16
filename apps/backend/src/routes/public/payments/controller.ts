import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { startPaymentSchema, StartPaymentInput } from "./schema";
import { PaymentProviderFactory } from "@src/services/paymentProvider/PaymentProviderFactory";
import { PaymentProviderName } from "@src/services/paymentProvider/PaymentProvider";
import { NotFoundError } from "@src/utils/app_error";
import { EncryptionService } from "@src/utils/encryption";

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

    const paymentProvider = PaymentProviderFactory.create(
      (profile?.paymentProviderName as PaymentProviderName) || PaymentProviderName.Stripe,
      {
        apiKeys: EncryptionService.decryptObject(
          {
            publicKey: profile.paymentProviderPublicKey!,
            privateKey: profile.paymentProviderPrivateKey!,
          },
          ["publicKey", "privateKey"],
        ),
      },
    );

    const result = await paymentProvider.startCharge({
      amount: body!.amount,
      currency: "usd",
      email: body!.email,
      returnUrl: "http://drenathan1.localhost:3001/checkout",
    });

    return result;
  }
}
