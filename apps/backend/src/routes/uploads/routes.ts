import { Router } from "express";
import { UploadsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";
import { InitRouteFunction } from "@src/types";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new UploadsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.post("/presigned-url", (...args) => controller.createPresignedUrl(...args));

  return router;
};

export default {
  path: "/uploads",
  init,
};
