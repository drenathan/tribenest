import { CreateTicketInput } from "@src/routes/events/schema";
import { EventService } from "..";

type Input = CreateTicketInput & {
  eventId: string;
};
export function createTicket(this: EventService, input: Input) {}
