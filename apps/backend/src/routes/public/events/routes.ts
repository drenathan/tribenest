import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicEvents } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicEvents(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.get("/", (...args) => controller.getMany(...args));
  router.get("/:id", (...args) => controller.getEventById(...args));
  router.post("/:id/checkout", (...args) => controller.createOrder(...args));
  router.post("/:id/finalize", (...args) => controller.finalizeOrder(...args));
  router.post("/validate-pass", (...args) => controller.validateEventPass(...args));
  return router;
};

export default {
  path: "/public/events",
  init,
};
