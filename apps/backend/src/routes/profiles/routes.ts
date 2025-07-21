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

  // Profile Configuration Routes
  router.get("/:id/configuration", (...args) => controller.getProfileConfiguration(...args));
  router.put("/:id/configuration", (...args) => controller.updateProfileConfiguration(...args));
  router.get("/:id/onboarding", (...args) => controller.getProfileOnboarding(...args));
  router.post("/:id/configuration/test-email", (...args) => controller.testEmailConfiguration(...args));
  router.post("/:id/configuration/test-r2", (...args) => controller.testR2Configuration(...args));
  router.post("/:id/configuration/test-payment", (...args) => controller.testPaymentConfiguration(...args));

  return router;
};

export default {
  path: "/profiles",
  init,
};
