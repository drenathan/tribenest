import "reflect-metadata";

import loadMiddlewares, { notFound } from "@src/middlewares";
import globalErrorHandler from "@src/utils/error_handler";
import express from "express";
import path from "path";
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
    // Handle admin subdomain - serve static files
    app.use((req, res, next) => {
      const subdomain = req.hostname.split(".")[0];
      if (subdomain === "admin") {
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
      } else {
        // For API subdomain or other requests, continue to API routes
        next();
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
