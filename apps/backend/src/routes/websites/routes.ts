import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { WebsitesController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new WebsitesController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));
  router.post("/activate", (...args) => controller.activateTheme(...args));
  router.get("/messages", (...args) => controller.getMessages(...args));
  router.get("/analytics", (...args) => controller.getWebsiteAnalytics(...args));
  router.get("/", (...args) => controller.getMany(...args));
  router.get("/:id", (...args) => controller.getOne(...args));
  router.put("/:id", (...args) => controller.updateWebsiteVersion(...args));
  router.post("/:id/publish", (...args) => controller.publishWebsiteVersion(...args));
  return router;
};

export default {
  path: "/websites",
  init,
};
