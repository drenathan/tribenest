import { DB } from "@src/db/types";
import { GetProductInput, GetProductsInput } from "@src/routes/product/schema";
import { BaseService } from "@src/services/baseService";
import { PaginatedData } from "@src/types";
import { Selectable } from "kysely";

export class ProductService extends BaseService {
  public async getProducts(
    input: GetProductsInput,
    membership?: Selectable<DB["memberships"]>,
  ): Promise<PaginatedData<{}>> {
    const { data, total } = await this.database.models.Product.getManyForPublic(input, membership);
    const hasNextPage = data.length === input.limit;

    return {
      hasNextPage,
      data,
      total: Number(total),
      page: input.page,
      pageSize: input.limit,
      nextPage: hasNextPage ? input.page + 1 : null,
    };
  }

  public async getOne(input: GetProductInput & { productId: string }, membership?: Selectable<DB["memberships"]>) {
    return this.database.models.Product.getOne(input);
  }
}
