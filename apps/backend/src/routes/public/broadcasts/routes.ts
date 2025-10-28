import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicWebsiteController } from "./controller";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicWebsiteController(services, workers);
  router.get("/", (...args) => controller.getBroadcasts(...args));
  router.get("/:id", (...args) => controller.getBroadcast(...args));
  return router;
};

export default {
  path: "/public/broadcasts",
  init,
};
