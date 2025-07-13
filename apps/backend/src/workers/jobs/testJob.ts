import { logger } from "@src/utils/logger";
import BaseJob from "../baseJob";

export default class TestJob extends BaseJob {
  name = "TEST_JOB";
  tags = ["worker", this.name];
  interval = "*/1 * * * *"; // every 30 seconds

  async handle() {
    logger.info({ tags: this.tags }, `Running job ${this.name} this is the handler`);
  }
}
