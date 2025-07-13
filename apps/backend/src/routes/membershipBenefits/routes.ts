import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { MembershipBenefitsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new MembershipBenefitsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.get("/", (...args) => controller.getMembershipBenefits(...args));
  router.post("/", (...args) => controller.createMembershipBenefit(...args));
  return router;
};

export default {
  path: "/membership-benefits",
  init,
};
