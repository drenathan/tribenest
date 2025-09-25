import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { StreamsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new StreamsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));
  router.get("/templates", (...args) => controller.getStreamTemplates(...args));
  router.post("/templates", (...args) => controller.createStreamTemplate(...args));
  router.get("/templates/:id", (...args) => controller.getStreamTemplate(...args));
  router.put("/templates/:id", (...args) => controller.updateStreamTemplate(...args));

  return router;
};

export default {
  path: "/streams",
  init,
};
