import { ProductService } from "..";
import { ExternalProduct } from "@src/services/_apis/store/ExternalStore";

export async function syncProducts(this: ProductService, input: { products: ExternalProduct[]; storeId: string }) {
  const trx = await this.database.client.startTransaction().execute();

  try {
    for (const item of input.products) {
      await this.syncProduct({ product: item, storeId: input.storeId }, trx);
    }

    await trx.commit().execute();
  } catch (error) {
    await trx.rollback().execute();
    throw error;
  }
}
