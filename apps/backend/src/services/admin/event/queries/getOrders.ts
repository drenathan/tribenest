import { GetOrdersInput } from "@src/routes/events/schema";
import { EventService } from "..";

type Input = GetOrdersInput;

export function getOrders(this: EventService, input: Input) {
  return this.models.EventTicketOrder.getProfileOrders(input);
}
