import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });
import crypto from "crypto";

import http from "http";
import { initApp } from "@src/app";
import { Services } from "./services";
import { Database } from "./db";
import { DEPLOYMENT, IS_DEVELOPMENT, PORT } from "./config/secrets";
import { logger } from "./utils/logger";
import handleProcessEvents from "./utils/process_events";
import { Workers } from "./workers";
import { Deployment } from "./types";

const startApp = async () => {
  logger.info("Starting app...");
  const database = new Database();
  const services = new Services(database);
  const workers = new Workers(services);

  if (IS_DEVELOPMENT || !DEPLOYMENT) {
    logger.info("starting workers in development");
    workers.start();
  }

  if (!IS_DEVELOPMENT && DEPLOYMENT === Deployment.Worker) {
    logger.info("starting workers in" + process.env.NODE_ENV);
    workers.start();
  }
  const args = { services, workers };
  const app = await initApp(args);
  const httpServer = http.createServer(app);

  //   if (IS_DEVELOPMENT || DEPLOYMENT === Deployment.Server) {
  //     // const io = new Server(httpServer, {
  //     //   cors: {
  //     //     origin: "*",
  //     //   },
  //     // });
  //     const { subscriber, publisher } = await bootstrapRedis();
  //     // const websocketHandler = new WebSocketHandler(io, services, workers, subscriber, publisher);
  //   }

  httpServer.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
    handleProcessEvents(httpServer);
  });
};

startApp();
