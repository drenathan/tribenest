import { CreateTicketInput } from "@src/routes/events/schema";
import { EventService } from "..";
import { NotFoundError } from "@src/utils/app_error";

type Input = CreateTicketInput & {
  eventId: string;
};

export async function createTicket(this: EventService, input: Input) {
  const event = this.models.Event.findOne({
    id: input.eventId,
    profileId: input.profileId,
  });

  if (!event) {
    throw new NotFoundError("Event not found");
  }

  const nextOrder = await this.models.EventTicket.getNextOrder(input.eventId);

  const ticket = await this.models.EventTicket.insertOne({
    title: input.title,
    description: input.description,
    price: input.price,
    quantity: input.quantity,
    eventId: input.eventId,
    order: nextOrder,
  });

  return ticket;
}
