import { EventService } from "..";
import { NotFoundError } from "@src/utils/app_error";
import { BadRequestError } from "@src/utils/app_error";

type Input = {
  eventId: string;
  ticketId: string;
  profileId: string;
};
export async function archiveTicket(this: EventService, input: Input) {
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

  if (ticket.archivedAt) {
    throw new BadRequestError("Ticket is already archived");
  }

  await this.models.EventTicket.updateOne({ id: input.ticketId }, { archivedAt: new Date() });

  return true;
}
