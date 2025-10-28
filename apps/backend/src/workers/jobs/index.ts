import { Services } from "@src/services";
import { Queue } from "bullmq";
import TestJob from "./testJob";
import ProcessOrderJob from "./order/processOrder";
import { Database } from "@src/db";
import ProcessEmailJob from "./emails/processEmail";
import SyncExternalProductsJob from "./products/SyncExternalProducts";
import ResendDigitalDeliveryJob from "./order/resendDigitalDelivery";
import ProcessTicketOrderJob from "./order/processTicketOrder";
import FetchCommentsJob from "./broadcast/fetchComments";

export const bootstrapJobs = (queue: Queue, services: Services, database: Database) => {
  return {
    testJob: new TestJob(queue, services, database),
    order: {
      processOrder: new ProcessOrderJob(queue, services, database),
      resendDigitalDelivery: new ResendDigitalDeliveryJob(queue, services, database),
      processTicketOrder: new ProcessTicketOrderJob(queue, services, database),
    },
    emails: {
      processEmail: new ProcessEmailJob(queue, services, database),
    },
    products: {
      syncExternalProducts: new SyncExternalProductsJob(queue, services, database),
    },
    broadcast: {
      fetchComments: new FetchCommentsJob(queue, services, database),
    },
  };
};
