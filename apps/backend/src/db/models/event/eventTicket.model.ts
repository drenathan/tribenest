import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EventTicketModel extends BaseModel<"eventTickets", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "eventTickets", "id");
  }

  public async getNextOrder(eventId: string) {
    const result = await this.client
      .selectFrom("eventTickets")
      .select((eb) => eb.fn.max("order").as("max"))
      .where("eventId", "=", eventId)
      .execute();

    return result[0]?.max ? result[0].max + 1 : 1;
  }
}
