import { PaymentProvider, PaymentProviderArgs, PaymentProviderName } from "./PaymentProvider";
import { PaymentProviderStripe } from "./PaymentProviderStripe";

export class PaymentProviderFactory {
  public static create(name: PaymentProviderName, args: PaymentProviderArgs): PaymentProvider {
    switch (name) {
      case PaymentProviderName.Stripe:
        return new PaymentProviderStripe(args);
      default:
        throw new Error(`Payment provider ${name} not found`);
    }
  }
}
