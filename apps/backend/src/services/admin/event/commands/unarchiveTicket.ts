import { BadRequestError, NotFoundError } from "@src/utils/app_error";
import { EventService } from "..";

type Input = {
  eventId: string;
  ticketId: string;
  profileId: string;
};

export async function unarchiveTicket(this: EventService, input: Input) {
  const ticket = await this.models.EventTicket.findById(input.ticketId);

  if (!ticket) {
    throw new NotFoundError("Ticket not found");
  }

  const event = await this.models.Event.findOne({
    id: ticket.eventId,
    profileId: input.profileId,
  });

  if (!event) {
    throw new NotFoundError("Event not found");
  }

  if (!ticket.archivedAt) {
    throw new BadRequestError("Ticket is not archived");
  }

  await this.models.EventTicket.updateOne({ id: input.ticketId }, { archivedAt: null });

  return true;
}
