import { Services } from "@src/services";
import { Queue } from "bullmq";
import TestJob from "./testJob";
import ProcessOrderJob from "./order/processOrder";

export const bootstrapJobs = (queue: Queue, services: Services) => {
  return {
    testJob: new TestJob(queue, services),
    order: {
      processOrder: new ProcessOrderJob(queue, services),
    },
  };
};
