import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicSaves } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicSaves(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.post("/", (...args) => controller.save(...args));
  router.delete("/", (...args) => controller.unsave(...args));
  router.get("/status", (...args) => controller.getSaveStatus(...args));
  router.get("/count", (...args) => controller.getSaveCount(...args));
  return router;
};

export default {
  path: "/public/saves",
  init,
};
