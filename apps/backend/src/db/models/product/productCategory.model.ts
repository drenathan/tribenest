import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProductCategory = DB["productCategories"];

export class ProductCategoryModel extends BaseModel<"productCategories", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "productCategories", "id");
  }
}
