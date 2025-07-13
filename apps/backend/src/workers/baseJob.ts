import { Services } from "@src/services";
import { Queue } from "bullmq";

// import Workers from ".";
import { logger } from "@src/utils/logger";

export default abstract class BaseJob<Payload = {}> {
  abstract name: string;
  //   protected workers!: Workers;
  public interval?: string;
  abstract tags: string[];

  constructor(protected queue: Queue, protected services: Services) {}

  abstract handle(payload: Payload): Promise<any>;

  // run the job immediately
  async now(payload?: Payload) {
    logger.info({ tags: this.tags }, `Queueing job ${this.name}`);
    await this.queue.add(this.name, payload);
  }

  //   setWorkers(workers: Workers) {
  //     this.workers = workers;
  //   }

  // run the job at a specific time
  async schedule(when: Date, payload?: Payload) {
    logger.info({ tags: this.tags }, `Scheduling job ${this.name} for ${when}`);

    const delay = when.getTime() - Date.now();

    await this.queue.add(this.name, payload, {
      delay,
    });
  }
}
