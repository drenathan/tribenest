import { EventService } from "..";

type Input = {
  eventId: string;
  profileId: string;
};
export function getTickets(this: EventService, input: Input) {}
