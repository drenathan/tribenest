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
};

export type IProductTrack = {
  id: string;
  title: string;
  description: string;
  media: IMedia[];
  isFeatured: boolean;
  hasExplicitContent: boolean;
  artist: string;
};
