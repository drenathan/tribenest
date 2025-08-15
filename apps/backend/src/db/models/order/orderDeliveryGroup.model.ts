import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class OrderDeliveryGroupModel extends BaseModel<"orderDeliveryGroups", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "orderDeliveryGroups", "id");
  }
}
