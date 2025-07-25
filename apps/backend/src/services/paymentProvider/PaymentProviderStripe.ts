import {
  ChargeInput,
  ChargeResponse,
  CreateCustomerInput,
  CreateCustomerResponse,
  CreatePriceInput,
  CreatePriceResponse,
  CreateSubscriptionInput,
  CreateSubscriptionResponse,
  GetSubscriptionResponse,
  PaymentProvider,
  PaymentProviderArgs,
  PaymentProviderName,
  PaymentStatus,
  SubscriptionStatus,
  UpdateSubscriptionInput,
  UpdateSubscriptionResponse,
} from "./PaymentProvider";
import Stripe from "stripe";

export class PaymentProviderStripe extends PaymentProvider<Stripe> {
  public name = PaymentProviderName.Stripe;
  public client: Stripe;

  constructor(args: PaymentProviderArgs) {
    super(args);
    this.client = new Stripe(args.apiKeys.privateKey, {
      apiVersion: "2024-09-30.acacia",
    });
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

  public async createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResponse> {
    const customer = await this.client.customers.create({
      email: input.email,
      name: input.name,
    });

    return {
      customerId: customer.id,
    };
  }

  public async getCustomer(customerId: string): Promise<CreateCustomerResponse | null> {
    const customer = await this.client.customers.retrieve(customerId);

    return {
      customerId: customer.id,
    };
  }

  public async createPrice(input: CreatePriceInput): Promise<CreatePriceResponse> {
    const price = await this.client.prices.create({
      unit_amount: Math.round(input.amount * 100),
      currency: input.currency,
      recurring: {
        interval: input.billingCycle,
      },
      product_data: { name: `${input.amount} per ${input.billingCycle}` },
    });

    return {
      priceId: price.id,
    };
  }

  public async createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResponse> {
    const subscription = await this.client.subscriptions.create({
      customer: input.customerId,
      items: [{ price: input.priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      payment_settings: {
        payment_method_types: ["card"],
      },
    });

    return {
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      clientSecret:
        ((subscription.latest_invoice as Stripe.Invoice)?.payment_intent as Stripe.PaymentIntent)?.client_secret ?? "",
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.cancel(subscriptionId);
  }

  public async updateSubscription(input: UpdateSubscriptionInput): Promise<UpdateSubscriptionResponse> {
    const price = await this.client.prices.create({
      unit_amount: Math.round(input.amount * 100),
      currency: input.currency,
      recurring: {
        interval: input.billingCycle,
      },
      product_data: { name: `${input.subscriptionId}${input.amount} per ${input.billingCycle}` },
    });

    const subscription = await this.client.subscriptions.update(input.subscriptionId, {
      items: [{ price: price.id }],
    });

    return {
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      priceId: price.id,
    };
  }

  public decryptWebhook(body: any, signature: string): any {
    return this.client.webhooks.constructEvent(body, signature, this.apiKeys.webhookSecret!);
  }

  public async getSubscription(subscriptionId: string): Promise<GetSubscriptionResponse> {
    const subscription = await this.client.subscriptions.retrieve(subscriptionId);

    return {
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      status: subscription.status as SubscriptionStatus,
    };
  }
}
