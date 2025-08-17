import { EventService } from "..";

type Input = {
  eventId: string;
  ticketId: string;
  profileId: string;
};
export function unarchiveTicket(this: EventService, input: Input) {}
