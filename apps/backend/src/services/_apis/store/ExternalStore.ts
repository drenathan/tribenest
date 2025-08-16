export enum ExternalStoreProvider {
  Printful = "printful",
}

export type ExternalStoreArgs = {
  accessToken: string;
};

export type ExternalProductVariant = {
  id: string;
  availabilityStatus: string;
  size: string;
  color: string;
  price: number;
  images: string[];
  name: string;
};

export type ExternalProduct = {
  id: string;
  name: string;
  coverImage: string;
  variants: ExternalProductVariant[];
};

export type ExternalStoreDetails = {
  name: string;
  externalId: string;
};

export type GetShippingCostInput = {
  items: { productVariantId: string; quantity: number }[];
  recipient: {
    address1: string;
    city: string;
    stateCode: string;
    countryCode: string;
    zip: string;
    name: string;
  };
};

export type GetShippingCostResult = {
  shippingCost: number;
  externalId: string;
};

export type ExternalOrderDetails = {
  id: number;
  status: string;
  error: string;
};

export abstract class ExternalStore {
  public abstract provider: ExternalStoreProvider;

  constructor(args: ExternalStoreArgs) {}

  public abstract getProducts(offset: number, limit: number): Promise<ExternalProduct[]>;

  public abstract validateAccessToken(): Promise<boolean>;
  public abstract getStoreDetails(): Promise<ExternalStoreDetails>;

  public abstract getDefaults(): Promise<Record<string, any>>;

  public abstract getShippingCost(input: GetShippingCostInput): Promise<GetShippingCostResult>;
  public abstract confirmOrder(orderId: string): Promise<void>;

  public abstract getOrderDetails(orderId: string): Promise<ExternalOrderDetails>;

  public abstract setupWebhook(webhookUrl: string): Promise<void>;
}
