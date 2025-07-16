import "reflect-metadata";

import loadMiddlewares, { notFound } from "@src/middlewares";
import globalErrorHandler from "@src/utils/error_handler";
import express from "express";
import path from "path";
import next from "next";
import fs from "fs";
import { Deployment, InitRouteArgs } from "./types";
import { DEPLOYMENT, IS_DEVELOPMENT, IS_E2E, IS_PRODUCTION, IS_TEST, MULTI_TENANT } from "./configuration/secrets";
import { initRoutes } from "./routes";
import i18nInit from "./i18n";
import { logger } from "./utils/logger";

export const initApp = async (args: InitRouteArgs) => {
  if (!IS_TEST) logger.info("initializing app...");
  i18nInit();
  const app = express();
  loadMiddlewares(app);

  if (IS_PRODUCTION && (!DEPLOYMENT || DEPLOYMENT === Deployment.Server)) {
    // Initialize Next.js app for client subdomain
    const nextApp = next({
      dev: false,
      dir: path.join(__dirname, "../../client"),
      conf: {
        env: {
          MULTI_TENANT,
        },
      },
    });
    const nextHandler = nextApp.getRequestHandler();
    await nextApp.prepare();

    app.use((req, res, next) => {
      const subdomain = req.hostname.split(".")[0];
      switch (subdomain) {
        case "api":
          // For API subdomain, do nothing - let it continue to the API routes
          next();
          break;
        case "admin":
          // For admin subdomain, serve static files and fallback to index.html
          const adminPath = path.join(__dirname, "../../admin/dist");
          const filePath = path.join(adminPath, req.path);

          // Check if the file exists
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.sendFile(filePath);
          } else {
            // Fallback to index.html for SPA routing
            res.sendFile(path.join(adminPath, "index.html"));
          }
          break;
        default:
          // For any other subdomain, serve the Next.js client app
          return nextHandler(req, res);
      }
    });
  }

  if (!IS_DEVELOPMENT || !DEPLOYMENT || DEPLOYMENT === Deployment.Server) {
    const router = initRoutes(args);
    app.use(router);
  }

  if (DEPLOYMENT === Deployment.Worker) {
    app.get("/", (req, res) => {
      res.status(200).send("Hello World");
    });
  }

  if (IS_DEVELOPMENT || IS_TEST || IS_E2E) {
    const router = initRoutes(args);
    app.use(router);
  }
  notFound(app);
  app.use(globalErrorHandler);

  return app;
};
