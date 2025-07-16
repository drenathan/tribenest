import { Queue } from "bullmq";
import { Services } from "@src/services";
import { AccountWelcomeTemplate } from "./templates/account/welcome";
import { OrderDeliveryTemplate } from "./templates/order/delivery";

export const bootstrapEmails = (queue: Queue, services: Services) => {
  return {
    welcome: new AccountWelcomeTemplate(queue, services),
    orderDelivery: new OrderDeliveryTemplate(queue, services),
  };
};
