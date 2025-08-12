import { logger } from "@src/utils/logger";
import { OrderStatus } from "@src/db/types/product";
import BaseJob from "@src/workers/baseJob";
import { EncryptionService } from "@src/utils/encryption";

type Args = {
  storeId: string;
  page?: number;
};

export default class SyncExternalProductsJob extends BaseJob<Args> {
  name = "SYNC_EXTERNAL_PRODUCTS_JOB";
  tags = ["worker", this.name];
  // retryCount = 3;

  async handle({ storeId, page = 1 }: Args) {
    logger.info({ tags: this.tags }, `Syncing external products for store ${storeId} with page ${page}`);

    const limit = 10;
    const offset = (page - 1) * limit;
    const store = await this.database.models.ProductStore.findById(storeId);

    if (!store) {
      logger.error({ tags: this.tags }, `Store ${storeId} not found`);
      return;
    }

    const decrypted = EncryptionService.decryptObject({ accessToken: store.accessToken }, ["accessToken"]);

    const storeApi = await this.services.apis.getExternalStore(store.provider, decrypted.accessToken);
    const products = await storeApi.getProducts(offset, limit);

    logger.info({ tags: this.tags }, `Found ${products.length} products`);

    if (products.length === 0) {
      logger.info({ tags: this.tags }, `No more products to sync`);
      await this.database.models.ProductStore.updateOne({ id: storeId }, { lastSyncedAt: new Date() });
      return;
    }

    logger.info({ tags: this.tags }, `Syncing ${products.length} products`);
    await this.services.admin.products.syncProducts({ products, storeId });

    logger.info({ tags: this.tags }, `Queuing next batch Page: ${page + 1}`);
    await this.now({ storeId, page: page + 1 });
  }
}
