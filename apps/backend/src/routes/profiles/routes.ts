import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { ProfilesController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new ProfilesController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.post("/", (...args) => controller.createProfile(...args));
  router.post("/validate-subdomain", (...args) => controller.validateSubdomain(...args));
  router.post("/:id/media", (...args) => controller.uploadMedia(...args));
  router.get("/:id/media", (...args) => controller.getMedia(...args));

  return router;
};

export default {
  path: "/profiles",
  init,
};
