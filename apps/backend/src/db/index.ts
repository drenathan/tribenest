export { default as Database } from "./Database";

import { REDIS_URL } from "@src/configuration/secrets";
import { logger } from "@src/utils/logger";
import { createClient } from "redis";

const publisher = createClient({
  url: REDIS_URL,
  pingInterval: 3000, // keep-alive interval
});
const subscriber = publisher.duplicate();

export const bootstrapRedis = async () => {
  await publisher.connect();
  await subscriber.connect();
  logger.info("Redis connected");
  return { publisher, subscriber };
};
