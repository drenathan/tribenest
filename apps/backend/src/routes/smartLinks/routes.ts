import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { SmartLinksController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new SmartLinksController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.get("/", (...args) => controller.getManySmartLinks(...args));
  router.post("/", (...args) => controller.createSmartLink(...args));
  router.put("/:id", (...args) => controller.updateSmartLink(...args));
  router.delete("/:id", (...args) => controller.archiveSmartLink(...args));
  router.post("/:id/unarchive", (...args) => controller.unarchiveSmartLink(...args));
  router.get("/:id/analytics", (...args) => controller.getSmartLinkAnalytics(...args));
  return router;
};

export default {
  path: "/smart-links",
  init,
};
