import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicLikes } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicLikes(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.post("/", (...args) => controller.like(...args));
  router.delete("/", (...args) => controller.unlike(...args));
  router.get("/status", (...args) => controller.getLikeStatus(...args));
  router.get("/count", (...args) => controller.getLikeCount(...args));
  return router;
};

export default {
  path: "/public/likes",
  init,
};
