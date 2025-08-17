import { UpdateTicketInput } from "@src/routes/events/schema";
import { EventService } from "..";
import { BadRequestError, NotFoundError } from "@src/utils/app_error";

type Input = UpdateTicketInput & {
  eventId: string;
  ticketId: string;
  profileId: string;
};

export async function updateTicket(this: EventService, input: Input) {
  const ticket = await this.models.EventTicket.findById(input.ticketId);

  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }
  const event = this.models.Event.findOne({
    id: ticket.eventId,
    profileId: input.profileId,
  });

  if (!event) {
    throw new NotFoundError("Event not found");
  }

  if (ticket.archivedAt) {
    throw new BadRequestError("Ticket is archived");
  }

  if (ticket.quantity < ticket.sold) {
    throw new BadRequestError("Ticket quantity is less than tickets sold");
  }

  await this.models.EventTicket.updateOne(
    { id: input.ticketId },
    {
      title: input.title,
      description: input.description,
      price: input.price,
      quantity: input.quantity,
    },
  );

  return true;
}
