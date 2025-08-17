import { ReorderTicketsInput } from "@src/routes/events/schema";
import { EventService } from "..";

type Input = ReorderTicketsInput & {
  eventId: string;
  profileId: string;
};
export function reorderTickets(this: EventService, input: Input) {}
