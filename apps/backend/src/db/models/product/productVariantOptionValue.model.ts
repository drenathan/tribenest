import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProductVariantOptionValue = DB["productVariantOptionValues"];

export class ProductVariantOptionValueModel extends BaseModel<"productVariantOptionValues", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "productVariantOptionValues", "id");
  }
}
