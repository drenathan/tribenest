import { logger } from "@src/utils/logger";
import { Queue, Worker } from "bullmq";
import { bootstrapJobs } from "./jobs";
import { Services } from "@src/services";
import cronParser from "cron-parser";

import BaseJob from "./baseJob";
import { isNil } from "lodash";
import { bootstrapEmails } from "./emails";
import { IS_DEVELOPMENT, IS_TEST } from "@src/configuration/secrets";
import BaseEmailTemplate from "./emails/BaseEmailTemplate";
const QUEUE_NAME = "tribeNestMainQueue";
const SCHEDULER_ID = "tribeNestScheduler";

export class Workers {
  jobs: ReturnType<typeof bootstrapJobs>;
  private queue: Queue;
  private tags = ["worker", "bootstrap"];
  emails: ReturnType<typeof bootstrapEmails>;

  constructor(services: Services) {
    logger.info("Initializing workers");
    if (IS_TEST) {
      this.queue = {} as Queue;
      this.jobs = bootstrapJobs(this.queue, services);
      this.emails = bootstrapEmails(this.queue, services);
      return;
    }

    this.queue = new Queue(QUEUE_NAME, {
      connection: { url: process.env.REDIS_URL },
    });

    this.jobs = bootstrapJobs(this.queue, services);
    this.emails = bootstrapEmails(this.queue, services);

    this.scheduleJobs();
  }

  async scheduleJobs() {
    const scheduledJobs = this.getAllScheduledJobs();

    logger.info({ tags: this.tags }, "Scheduling jobs");
    scheduledJobs.forEach((job) => {
      try {
        cronParser.parse(job.interval as string); // throws an error if the interval is invalid
        logger.info({ tags: this.tags }, `Scheduling job ${job.name} with interval ${job.interval}`);
        this.queue.upsertJobScheduler(SCHEDULER_ID, { pattern: job.interval }, { name: job.name });
      } catch (error) {
        throw new Error(`Recurring job ${job.name} has an invalid interval defined`);
      }
    });
  }

  async start() {
    const jobs = [...this.getAllJobs(), ...this.getAllEmails()];
    const worker = new Worker(
      QUEUE_NAME,
      async (job) => {
        const handler = jobs.find((j) => j.name === job.name);

        if (!handler) {
          logger.error({ tags: this.tags }, `No handler found for job ${job.name}`);
          return;
        }

        logger.info({ tags: handler.tags }, `Running job ${job.name}`);
        const start = Date.now();
        await handler.handle(job.data);
        const end = Date.now();
        logger.info({ tags: handler.tags }, `Job ${job.name} completed in ${(end - start) / 1000} seconds`);
      },
      { connection: { url: process.env.REDIS_URL }, autorun: false },
    );

    worker.on("completed", (job) => {
      logger.info({ tags: ["worker", job?.name] }, `Job ${job?.name} completed`);
    });

    worker.on("failed", async (job, err) => {
      if (IS_DEVELOPMENT) {
        console.log(err);
      }
      if (!job) return;
      const handler = jobs.find((j) => j.name === job.name);

      if (handler) {
        try {
          await handler.onFailure(job.data);
        } catch (error) {
          logger.error({ tags: ["worker", job?.name] }, `Error calling onFailure for job ${job?.name}: ${error}`);
        }
      }

      logger.error({ tags: ["worker", job?.name] }, `Job ${job?.name} failed: ${err}`);
    });
    worker.on("error", (err) => {
      logger.error({ tags: ["worker"] }, `Worker error: ${err}`);
    });

    worker.run();

    logger.info({ tags: this.tags }, "Worker started");
  }

  getAllJobs(next?: Object, previous?: BaseJob[]): BaseJob[] {
    const jobs: BaseJob[] = previous || []; // start with an empty array
    if (!next) next = this.jobs; // start with the jobs object

    if (next instanceof BaseJob) {
      jobs.push(next);
      return jobs;
    }

    if (typeof next === "object") {
      Object.values(next).forEach((value) => this.getAllJobs(value, jobs));
    }

    return jobs;
  }
  getAllEmails(next?: Object, previous?: BaseEmailTemplate<any>[]): BaseEmailTemplate<any>[] {
    const jobs: BaseEmailTemplate<any>[] = previous || []; // start with an empty array
    if (!next) next = this.emails; // start with the jobs object

    if (next instanceof BaseEmailTemplate) {
      jobs.push(next);
      return jobs;
    }

    if (typeof next === "object") {
      Object.values(next).forEach((value) => this.getAllJobs(value, jobs));
    }

    return jobs;
  }

  getAllScheduledJobs(): BaseJob[] {
    return this.getAllJobs().filter((job) => !isNil(job.interval));
  }

  setWorkersInstanceOnJobs() {
    this.getAllJobs().forEach((job) => job.setWorkers(this));
  }
}
