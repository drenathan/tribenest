import type { IMedia } from "./post";

export enum ProductDeliveryType {
  Digital = "digital",
  Physical = "physical",
}

export enum ProductCategory {
  Music = "Music",
  Merch = "Merch",
}

export type IProduct = {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  media: IMedia[];
  variants: IProductVariant[];
  artist: string;
  credits: string;
  publishedAt: string;
  archivedAt: string | null;
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
