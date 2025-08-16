import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EventTicketOrderItemModel extends BaseModel<"eventTicketOrderItems", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "eventTicketOrderItems", "id");
  }
}
