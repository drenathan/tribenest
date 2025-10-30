import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicWebsiteController } from "./controller";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicWebsiteController(services, workers);
  router.get("/", (...args) => controller.getBroadcasts(...args));
  router.get("/:id", (...args) => controller.getBroadcast(...args));
  router.post("/:id/leave", (...args) => controller.leaveBroadcast(...args));
  router.post("/:id/validate-session", (...args) => controller.validateSession(...args));
  return router;
};

export default {
  path: "/public/broadcasts",
  init,
};
