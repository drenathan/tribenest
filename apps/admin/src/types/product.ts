import type { IMedia } from "./post";

export enum ProductDeliveryType {
  Digital = "digital",
  Physical = "physical",
}

export enum ExternalStoreProvider {
  Printful = "printful",
}

export enum ProductCategory {
  Music = "Music",
  Merch = "Merch",
}

export type IProduct = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: ProductCategory;
  profileId: string;
  media: IMedia[];
  variants: IProductVariant[];
  artist: string;
  credits: string;
  publishedAt: string;
  archivedAt: string | null;
  isFeatured: boolean;
};

export type IProductStore = {
  id: string;
  name: string;
  provider: ExternalStoreProvider;
  accessToken: string;
  lastSyncedAt: string;
};

export type IProductVariant = {
  id: string;
  deliveryType: ProductDeliveryType;
  title: string;
  description: string;
  price: number;
  media: IMedia[];
  tracks: IProductTrack[];
  isDefault: boolean;
  upcCode: string;
  payWhatYouWant: boolean;
  availabilityStatus: "active" | "temporarily_out_of_stock";
};

export type IProductTrack = {
  id: string;
  title: string;
  description: string;
  media: IMedia[];
  isFeatured: boolean;
  hasExplicitContent: boolean;
  artist: string;
  credits: string;
  isrcCode: string;
};
