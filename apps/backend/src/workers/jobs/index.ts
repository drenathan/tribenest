import { Services } from "@src/services";
import { Queue } from "bullmq";
import TestJob from "./testJob";

export const bootstrapJobs = (queue: Queue, services: Services) => {
  return {
    testJob: new TestJob(queue, services),
  };
};
