import { EventService } from "..";

type Input = {
  eventId: string;
  ticketId: string;
  profileId: string;
};
export function archiveTicket(this: EventService, input: Input) {}
