import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EventPassModel extends BaseModel<"eventPasses", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "eventPasses", "id");
  }

  public async getPassesByOrderItemId({ orderId }: { orderId: string }) {
    const data = await this.client
      .selectFrom("eventPasses as ep")
      .innerJoin("eventTicketOrderItems as etoi", "ep.eventTicketOrderItemId", "etoi.id")
      .innerJoin("eventTicketOrders as eto", "etoi.eventTicketOrderId", "eto.id")
      .innerJoin("eventTickets as et", "et.id", "ep.eventTicketId")
      .innerJoin("events as e", "e.id", "et.eventId")
      .where("eto.id", "=", orderId)
      .select([
        "ep.id",
        "et.title as ticketTitle",
        "e.title as eventTitle",
        "ep.ownerName",
        "ep.ownerEmail",
        "ep.checkedInAt",
      ])
      .execute();

    return data;
  }
}
