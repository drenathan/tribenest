import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { createProduct } from "./commands/createProduct";
import { GetProductsInput } from "@src/routes/product/schema";
import { PaginatedData } from "@src/types";
import { updateProduct } from "./commands/updateProduct";
import { GetManyProductResult } from "@src/db/models/product/product.model";
import { syncProducts } from "./commands/syncProducts";
import { syncProduct } from "./commands/syncProduct";
import { createProductStore } from "./commands/createProductStore";
import { getStores } from "./queries/getStores";

export class ProductService extends BaseService {
  public create: typeof createProduct;
  public update: typeof updateProduct;
  public syncProducts: typeof syncProducts;
  public syncProduct: typeof syncProduct;
  public createProductStore: typeof createProductStore;
  public getStores: typeof getStores;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.create = createProduct.bind(this);
    this.update = updateProduct.bind(this);
    this.syncProducts = syncProducts.bind(this);
    this.syncProduct = syncProduct.bind(this);
    this.createProductStore = createProductStore.bind(this);
    this.getStores = getStores.bind(this);
  }

  public async getProducts(input: GetProductsInput): Promise<PaginatedData<{}>> {
    const result = await this.database.models.Product.getMany(input);
    const hasNextPage = result.data.length === input.limit;
    return {
      data: result.data,
      total: result.total as number,
      page: input.page,
      hasNextPage,
      nextPage: hasNextPage ? input.page + 1 : null,
      pageSize: input.limit,
    };
  }

  public async archiveProduct(productId: string): Promise<void> {
    await this.database.models.Product.updateOne(
      { id: productId },
      {
        archivedAt: new Date(),
      },
    );
  }

  public async unarchiveProduct(productId: string): Promise<void> {
    await this.database.models.Product.updateOne(
      { id: productId },
      {
        archivedAt: null,
      },
    );
  }

  public async getOne(input: { profileId: string; productId: string }): Promise<GetManyProductResult[number]> {
    return await this.database.models.Product.getOne({ productId: input.productId, profileId: input.profileId });
  }
}
