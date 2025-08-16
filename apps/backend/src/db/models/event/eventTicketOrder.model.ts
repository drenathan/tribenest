import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EventTicketOrderModel extends BaseModel<"eventTicketOrders", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "eventTicketOrders", "id");
  }
}
