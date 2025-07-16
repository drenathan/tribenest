import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
export type IOrderItem = DB["orderItems"];

export class OrderItemModel extends BaseModel<"orderItems", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "orderItems", "id");
  }
}
