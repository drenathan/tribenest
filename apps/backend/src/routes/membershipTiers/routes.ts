import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { MembershipTiersController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new MembershipTiersController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.get("/", (...args) => controller.getMembershipTiers(...args));
  router.post("/", (...args) => controller.createMembershipTier(...args));
  router.put("/:id", (...args) => controller.updateMembershipTier(...args));
  router.post("/:id/archive", (...args) => controller.archiveMembershipTier(...args));
  router.post("/:id/unarchive", (...args) => controller.unarchiveMembershipTier(...args));
  router.post("/reorder", (...args) => controller.reorderMembershipTiers(...args));
  router.put("/:id/benefits", (...args) => controller.updateMembershipTierBenefits(...args));
  return router;
};

export default {
  path: "/membership-tiers",
  init,
};
