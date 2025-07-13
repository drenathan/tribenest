import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProductVariantConfiguration = DB["productVariantConfigurations"];

export class ProductVariantConfigurationModel extends BaseModel<"productVariantConfigurations", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "productVariantConfigurations", "id");
  }
}
