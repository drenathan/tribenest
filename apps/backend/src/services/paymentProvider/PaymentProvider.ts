export type PaymentProviderArgs = {
  apiKeys: {
    privateKey: string;
    publicKey?: string;
    webhookSecret?: string;
  };
};

export type ChargeInput = {
  amount: number;
  currency: string;
  description?: string;
  email?: string;
  customerId?: string;
  returnUrl: string;
};

export type ChargeResponse = {
  paymentId: string;
  amount: number;
  currency: string;
  paymentSecret: string;
};

export enum PaymentProviderName {
  Stripe = "stripe",
}

export enum PaymentStatus {
  Pending = "pending",
  Succeeded = "succeeded",
  Failed = "failed",
}

export enum SubscriptionStatus {
  Active = "active",
  Incomplete = "incomplete",
  IncompleteExpired = "incomplete_expired",
  PastDue = "past_due",
  Canceled = "canceled",
}

export type CreateCustomerInput = {
  email: string;
  name?: string;
};

export type CreateCustomerResponse = {
  customerId: string;
};

export type CreatePriceInput = {
  amount: number;
  currency: string;
  billingCycle: "month" | "year";
};

export type CreatePriceResponse = {
  priceId: string;
};

export type CreateSubscriptionInput = {
  customerId: string;
  priceId: string;
};

export type CreateSubscriptionResponse = {
  subscriptionId: string;
  clientSecret: string;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
};

export type UpdateSubscriptionInput = {
  subscriptionId: string;
  amount: number;
  currency: string;
  billingCycle: "month" | "year";
  customerId: string;
};

export type UpdateSubscriptionResponse = {
  subscriptionId: string;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
  priceId: string;
};

export type GetSubscriptionResponse = {
  subscriptionId: string;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
  status: SubscriptionStatus;
};

export abstract class PaymentProvider<T = {}> {
  public abstract name: PaymentProviderName;
  protected apiKeys: PaymentProviderArgs["apiKeys"];
  public abstract client: T;

  constructor(args: PaymentProviderArgs) {
    this.apiKeys = args.apiKeys;
  }

  public abstract startCharge(input: ChargeInput): Promise<ChargeResponse>;
  public abstract getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  public abstract createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResponse>;
  public abstract getCustomer(customerId: string): Promise<CreateCustomerResponse | null>;
  public abstract createPrice(input: CreatePriceInput): Promise<CreatePriceResponse>;
  public abstract createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResponse>;
  public abstract cancelSubscription(subscriptionId: string): Promise<void>;
  public abstract updateSubscription(input: UpdateSubscriptionInput): Promise<UpdateSubscriptionResponse>;
  public abstract getSubscription(subscriptionId: string): Promise<GetSubscriptionResponse>;
  public abstract decryptWebhook(...args: any[]): any;
  public abstract testConnection(): Promise<void>;
}
