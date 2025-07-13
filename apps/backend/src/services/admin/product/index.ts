import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { createProduct } from "./commands/createProduct";
import { GetProductsInput } from "@src/routes/product/schema";
import { PaginatedData } from "@src/types";

export class ProductService extends BaseService {
  public create: typeof createProduct;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.create = createProduct.bind(this);
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
}
