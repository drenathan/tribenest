import { Queue } from "bullmq";
import { Services } from "@src/services";
import { AccountWelcomeTemplate } from "./templates/account/welcome";
import { OrderDeliveryTemplate } from "./templates/order/delivery";
import { Database } from "@src/db";

export const bootstrapEmails = (queue: Queue, services: Services, database: Database) => {
  return {
    welcome: new AccountWelcomeTemplate(queue, services, database),
    orderDelivery: new OrderDeliveryTemplate(queue, services, database),
  };
};
