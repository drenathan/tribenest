import { UpdateTicketInput } from "@src/routes/events/schema";
import { EventService } from "..";

type Input = UpdateTicketInput & {
  eventId: string;
};
export function updateTicket(this: EventService, input: Input) {}
