import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProductVariantOption = DB["productVariantOptions"];

export class ProductVariantOptionModel extends BaseModel<"productVariantOptions", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "productVariantOptions", "id");
  }
}
