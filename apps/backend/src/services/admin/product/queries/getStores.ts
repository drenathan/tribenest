import { ProductService } from "..";

export async function getStores(this: ProductService, { profileId }: { profileId: string }) {
  const stores = await this.database.models.ProductStore.find({ profileId });

  return stores;
}
