import { Services } from "@src/services";
import { Queue } from "bullmq";

// import Workers from ".";
import { logger } from "@src/utils/logger";
import { Workers } from ".";
import { Database } from "@src/db";

export default abstract class BaseJob<Payload = {}> {
  abstract name: string;
  public interval?: string;
  abstract tags: string[];
  protected workers!: Workers;
  public retryCount?: number;

  constructor(
    protected queue: Queue,
    protected services: Services,
    protected database: Database,
  ) {}

  abstract handle(payload: Payload): Promise<any>;
  onFailure(payload: Payload): Promise<void> {
    return Promise.resolve();
  }

  // run the job immediately
  async now(payload?: Payload) {
    logger.info({ tags: this.tags }, `Queueing job ${this.name}`);
    await this.queue.add(this.name, payload, {
      attempts: this.retryCount,
      backoff: {
        type: "exponential",
        delay: 60_000,
      },
    });
  }
  // run the job at a specific time
  async schedule(when: Date, payload?: Payload) {
    logger.info({ tags: this.tags }, `Scheduling job ${this.name} for ${when}`);

    const delay = when.getTime() - Date.now();

    await this.queue.add(this.name, payload, {
      delay,
    });
  }

  setWorkers(workers: Workers) {
    this.workers = workers;
  }
}
