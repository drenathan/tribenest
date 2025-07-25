import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { EventsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new EventsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.get("/", (...args) => controller.getEvents(...args));
  router.post("/", (...args) => controller.createEvent(...args));
  router.put("/", (...args) => controller.updateEvent(...args));
  router.post("/:id/archive", (...args) => controller.archiveEvent(...args));
  router.post("/:id/unarchive", (...args) => controller.unarchiveEvent(...args));

  return router;
};

export default {
  path: "/events",
  init,
};
