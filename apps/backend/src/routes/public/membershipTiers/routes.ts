import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicMembershipTier } from "./controller";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicMembershipTier(services, workers);
  router.get("/", (...args) => controller.getMembershipTiers(...args));
  return router;
};

export default {
  path: "/public/membership-tiers",
  init,
};
