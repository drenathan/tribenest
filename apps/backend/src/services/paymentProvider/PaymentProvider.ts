export type PaymentProviderArgs = {
  apiKeys: {
    privateKey: string;
    publicKey?: string;
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

export abstract class PaymentProvider {
  public abstract name: PaymentProviderName;
  private apiKeys: {
    privateKey: string;
    publicKey?: string;
  };

  constructor(args: PaymentProviderArgs) {
    this.apiKeys = args.apiKeys;
  }

  public abstract startCharge(input: ChargeInput): Promise<ChargeResponse>;
  public abstract getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}
