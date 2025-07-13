import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProductVariant = DB["productVariants"];

export class ProductVariantModel extends BaseModel<"productVariants", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "productVariants", "id");
  }
}
