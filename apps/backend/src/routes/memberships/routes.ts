import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { MembershipsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new MembershipsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));
  router.get("/", (...args) => controller.getMemberships(...args));

  return router;
};

export default {
  path: "/memberships",
  init,
};
