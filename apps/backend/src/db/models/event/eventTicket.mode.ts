import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EventTicketModel extends BaseModel<"eventTickets", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "eventTickets", "id");
  }
}
