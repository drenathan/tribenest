import { STRIPE_SECRET_KEY } from "@src/config/secrets";
import {
  ChargeInput,
  ChargeResponse,
  PaymentProvider,
  PaymentProviderArgs,
  PaymentProviderName,
  PaymentStatus,
} from "./PaymentProvider";
import Stripe from "stripe";

export class PaymentProviderStripe extends PaymentProvider {
  public name = PaymentProviderName.Stripe;
  private client: Stripe;

  constructor(args: PaymentProviderArgs) {
    super(args);
    this.client = new Stripe(args.apiKeys.privateKey || STRIPE_SECRET_KEY);
  }

  public async startCharge(input: ChargeInput): Promise<ChargeResponse> {
    const intent = await this.client.paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency,
      receipt_email: input.email,
      customer: input.customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      paymentId: intent.id,
      amount: input.amount,
      currency: input.currency,
      paymentSecret: intent.client_secret ?? "",
    };
  }

  public async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const intent = await this.client.paymentIntents.retrieve(paymentId);

    switch (intent.status) {
      case "succeeded":
        return PaymentStatus.Succeeded;
      case "processing":
        return PaymentStatus.Pending;
      default:
        return PaymentStatus.Failed;
    }
  }

  public async testConnection() {
    await this.client.paymentMethods.list({ limit: 1 });
  }
}
