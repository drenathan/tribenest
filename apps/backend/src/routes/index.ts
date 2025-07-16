import { IS_DEVELOPMENT, IS_E2E, IS_PRODUCTION, IS_TEST } from "@src/configuration/secrets";
import { InitRouteArgs, InitRouteFunction } from "@src/types";
import { logger } from "@src/utils/logger";
import { Router } from "express";
import express from "express";
import fs from "fs";
import path from "path";

export const initRoutes = (args: InitRouteArgs) => {
  if (!IS_TEST) logger.info("intialising routes...");
  const router = Router();

  router.get("/", (req, res) => {
    res.status(200).send("Hello World");
  });

  // Health check
  router.get("/healthcheck", (req, res) => {
    res.sendStatus(200);
  });

  // router.get("/test", async (req, res) => {
  //   await args.workers.jobs.notifications.MediaCreated.queue({
  //     userIds: ["656b6dad87c4c7ea8c632aee"],
  //     name: "James",
  //   });

  //   res.status(200).send("Test");
  // });

  const files = [] as string[];

  const getFilesRecursively = (directory: string) => {
    const filesInDirectory = fs.readdirSync(directory);
    for (const file of filesInDirectory) {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        getFilesRecursively(absolute);
      } else {
        files.push(path.relative(__dirname, absolute));
      }
    }
  };

  getFilesRecursively(__dirname);

  const routeFiles = files.filter((file) => file.endsWith(IS_PRODUCTION ? "routes.js" : "routes.ts"));

  for (const file of routeFiles) {
    const routeHandler = require(`./${file}`).default as {
      path: string;
      init: InitRouteFunction;
      disableBodyParser?: boolean;
    };

    if (!routeHandler?.path) throw new Error(`Missing path for ${file}`);
    if (!routeHandler?.init) throw new Error(`Missing init function for ${file}`);

    const handler = routeHandler.init(args);

    if (!handler) {
      throw new Error(`Missing router for ${routeHandler.path}`);
    }

    if (routeHandler.path === "/e2e" && !IS_E2E) continue;

    if (routeHandler.disableBodyParser) {
      router.use(`${routeHandler.path}`, handler);
    } else {
      router.use(`${routeHandler.path}`, express.json(), handler);
    }

    router.use(`${routeHandler.path}`, handler);

    if (!IS_TEST) {
      logger.info(`Route loaded: ${routeHandler.path}/*`);
    }
  }

  return router;
};
