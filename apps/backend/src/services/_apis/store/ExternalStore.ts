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

export abstract class ExternalStore {
  public abstract provider: ExternalStoreProvider;

  constructor(args: ExternalStoreArgs) {}

  public abstract getProducts(offset: number, limit: number): Promise<ExternalProduct[]>;

  public abstract validateAccessToken(): Promise<boolean>;
  public abstract getStoreDetails(): Promise<ExternalStoreDetails>;
}
