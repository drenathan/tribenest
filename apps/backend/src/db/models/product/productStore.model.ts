import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProductStore = DB["productStores"];

export class ProductStoreModel extends BaseModel<"productStores", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "productStores", "id");
  }
}
